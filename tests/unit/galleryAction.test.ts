import { afterEach, describe, expect, it, vi } from "vitest";

import { getGallery } from "@/app/actions/gallery";
import { getDrivePhotos } from "@/lib/googleDrive";

vi.mock("server-only", () => ({}));
vi.mock("@/lib/googleDrive", () => ({ getDrivePhotos: vi.fn() }));

const drivePhotos = vi.mocked(getDrivePhotos);

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("gallery server action", () => {
  it("defaults to demo without credentials or Google calls", async () => {
    vi.stubEnv("GALLERY_DEMO_MODE", undefined);
    vi.stubEnv("GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY", undefined);
    const result = await getGallery();
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.mode).toBe("demo");
      expect(result.data.photos).toHaveLength(24);
    }
    expect(drivePhotos).not.toHaveBeenCalled();
  });
  it("uses Drive only when demo mode is explicitly false", async () => {
    vi.stubEnv("GALLERY_DEMO_MODE", "false");
    drivePhotos.mockResolvedValue([]);
    const result = await getGallery();
    expect(result).toMatchObject({
      success: true,
      data: { mode: "drive", photos: [] },
    });
    expect(drivePhotos).toHaveBeenCalledOnce();
  });
  it("never leaks credentials or upstream errors", async () => {
    vi.stubEnv("GALLERY_DEMO_MODE", "false");
    drivePhotos.mockRejectedValue(
      new Error("SECRET_PRIVATE_KEY upstream details"),
    );
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    const result = await getGallery();
    expect(result.success).toBe(false);
    expect(JSON.stringify(result)).not.toContain("SECRET_PRIVATE_KEY");
    expect(JSON.stringify(result)).not.toContain("upstream details");
  });
});
