import { generateKeyPairSync } from "node:crypto";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { fetchDriveImage, getDrivePhotos } from "@/lib/googleDrive";

vi.mock("server-only", () => ({}));
vi.mock("next/cache", () => ({ unstable_cache: (fn: unknown) => fn }));

const FOLDER = "approved-folder";
const KEY = generateKeyPairSync("rsa", {
  modulusLength: 2048,
  privateKeyEncoding: { type: "pkcs8", format: "pem" },
  publicKeyEncoding: { type: "spki", format: "pem" },
}).privateKey;
const fetchMock = vi.fn<typeof fetch>();
const metadata = {
  id: "photo123",
  name: "[Travel] Morning_light.jpg",
  mimeType: "image/jpeg",
  size: "100",
  parents: [FOLDER],
  trashed: false,
};

beforeEach(() => {
  vi.stubEnv("GOOGLE_DRIVE_FOLDER_ID", FOLDER);
  vi.stubEnv(
    "GOOGLE_SERVICE_ACCOUNT_EMAIL",
    `test-${Math.random()}@example.com`,
  );
  vi.stubEnv("GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY", KEY);
  vi.stubEnv("GALLERY_SIGNING_SECRET", "test-secret-of-at-least-32-characters");
  vi.stubGlobal("fetch", fetchMock);
  fetchMock.mockResolvedValueOnce(
    Response.json({ access_token: "test-token", expires_in: 3600 }),
  );
});
afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  fetchMock.mockReset();
});

describe("Google Drive boundary", () => {
  it("maps metadata without returning access tokens, keys, or Google media links", async () => {
    fetchMock.mockResolvedValueOnce(
      Response.json({
        files: [
          { ...metadata, imageMediaMetadata: { width: 1000, height: 1500 } },
        ],
      }),
    );
    const photos = await getDrivePhotos();
    expect(photos[0]).toMatchObject({
      title: "Morning light",
      category: "Travel",
      width: 1000,
      height: 1500,
    });
    expect(photos[0].src).toMatch(/^\/api\/images\/photo123\?token=/);
    expect(JSON.stringify(photos)).not.toContain("test-token");
    expect(JSON.stringify(photos)).not.toContain("PRIVATE KEY");
    const listingUrl = String(fetchMock.mock.calls[1][0]);
    expect(new URL(listingUrl).searchParams.get("q")).toContain(
      `'${FOLDER}' in parents`,
    );
  });
  it.each([
    { ...metadata, parents: ["another-folder"] },
    { ...metadata, trashed: true },
    { ...metadata, mimeType: "image/svg+xml" },
    { ...metadata, size: "30000000" },
  ])(
    "blocks removed, trashed, active-content, or oversized files",
    async (file) => {
      fetchMock.mockResolvedValueOnce(Response.json(file));
      expect(await fetchDriveImage(metadata.id, FOLDER)).toBeNull();
      expect(fetchMock).toHaveBeenCalledTimes(2);
    },
  );
  it("blocks mismatched media content types", async () => {
    fetchMock.mockResolvedValueOnce(Response.json(metadata));
    fetchMock.mockResolvedValueOnce(
      new Response("<script>bad</script>", {
        headers: { "content-type": "text/html" },
      }),
    );
    expect(await fetchDriveImage(metadata.id, FOLDER)).toBeNull();
  });
  it("streams matching supported media", async () => {
    fetchMock.mockResolvedValueOnce(Response.json(metadata));
    fetchMock.mockResolvedValueOnce(
      new Response("jpeg data", { headers: { "content-type": "image/jpeg" } }),
    );
    const result = await fetchDriveImage(metadata.id, FOLDER);
    expect(result?.mimeType).toBe("image/jpeg");
    expect(await result?.response.text()).toBe("jpeg data");
  });
});
