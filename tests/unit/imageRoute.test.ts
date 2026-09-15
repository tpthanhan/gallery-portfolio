import { NextRequest } from "next/server";
import { afterEach, describe, expect, it, vi } from "vitest";

import { GET } from "@/app/api/images/[id]/route";
import { fetchDriveImage } from "@/lib/googleDrive";
import { createImageToken } from "@/lib/imageTokens";

vi.mock("server-only", () => ({}));
vi.mock("@/lib/googleDrive", () => ({ fetchDriveImage: vi.fn() }));

const SECRET = "route-test-signing-secret-of-at-least-32-characters";
const FOLDER = "portfolio-folder";
const ID = "image123";
const fetchImage = vi.mocked(fetchDriveImage);
const configure = () => {
  vi.stubEnv("GALLERY_DEMO_MODE", "false");
  vi.stubEnv("GOOGLE_DRIVE_FOLDER_ID", FOLDER);
  vi.stubEnv("GOOGLE_SERVICE_ACCOUNT_EMAIL", "gallery@example.com");
  vi.stubEnv("GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY", "not-a-real-key");
  vi.stubEnv("GALLERY_SIGNING_SECRET", SECRET);
};
const request = (token?: string) =>
  GET(
    new NextRequest(
      `http://localhost/api/images/${ID}${token == null ? "" : `?token=${token}`}`,
    ),
    { params: Promise.resolve({ id: ID }) },
  );

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("private Drive image proxy", () => {
  it("does not contact Drive in demo mode", async () => {
    vi.stubEnv("GALLERY_DEMO_MODE", "true");
    expect((await request()).status).toBe(404);
    expect(fetchImage).not.toHaveBeenCalled();
  });
  it("rejects missing or invalid capabilities before any upstream request", async () => {
    configure();
    expect((await request()).status).toBe(404);
    expect((await request("invalid")).status).toBe(404);
    expect(fetchImage).not.toHaveBeenCalled();
  });
  it("streams approved images with restrictive headers", async () => {
    configure();
    fetchImage.mockResolvedValue({
      response: new Response("image bytes"),
      mimeType: "image/jpeg",
    });
    const response = await request(createImageToken(ID, FOLDER, SECRET));
    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Type")).toBe("image/jpeg");
    expect(response.headers.get("Cache-Control")).toBe("private, no-store");
    expect(response.headers.get("X-Content-Type-Options")).toBe("nosniff");
    expect(await response.text()).toBe("image bytes");
  });
  it("does not serve revoked folder members", async () => {
    configure();
    fetchImage.mockResolvedValue(null);
    expect((await request(createImageToken(ID, FOLDER, SECRET))).status).toBe(
      404,
    );
  });
});
