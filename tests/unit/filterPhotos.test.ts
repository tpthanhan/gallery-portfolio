import { describe, expect, it } from "vitest";

import { ALL_WORK, EXPLORE_VIEW, SAVED_VIEW } from "@/constants/gallery";
import { filterPhotos } from "@/lib/filterPhotos";
import { SAMPLE_PHOTOS } from "@/lib/samplePhotos";

describe("gallery discovery", () => {
  it("returns the full gallery for a blank search", () => {
    expect(
      filterPhotos(SAMPLE_PHOTOS, ALL_WORK, "  ", EXPLORE_VIEW, []),
    ).toHaveLength(24);
  });
  it("filters categories without changing the original catalogue", () => {
    const result = filterPhotos(
      SAMPLE_PHOTOS,
      "Architecture",
      "",
      EXPLORE_VIEW,
      [],
    );
    expect(result.length).toBeGreaterThan(0);
    expect(result.every((photo) => photo.category === "Architecture")).toBe(
      true,
    );
    expect(SAMPLE_PHOTOS).toHaveLength(24);
  });
  it("searches case-insensitively across title and location using all terms", () => {
    const result = filterPhotos(
      SAMPLE_PHOTOS,
      ALL_WORK,
      " ALPINE italy ",
      EXPLORE_VIEW,
      [],
    );
    expect(result.map((photo) => photo.id)).toEqual(["alpine-stillness"]);
  });
  it("intersects saved, category, and search filters", () => {
    expect(
      filterPhotos(SAMPLE_PHOTOS, "Nature", "Italy", SAVED_VIEW, [
        "alpine-stillness",
        "soft-geometry",
      ]).map((photo) => photo.id),
    ).toEqual(["alpine-stillness"]);
    expect(
      filterPhotos(SAMPLE_PHOTOS, ALL_WORK, "", SAVED_VIEW, [
        "not-in-catalogue",
      ]),
    ).toEqual([]);
  });
  it("uses unique sample IDs and a trusted sample host", () => {
    expect(new Set(SAMPLE_PHOTOS.map((photo) => photo.id)).size).toBe(
      SAMPLE_PHOTOS.length,
    );
    for (const photo of SAMPLE_PHOTOS) {
      expect(new URL(photo.src).hostname).toBe("images.unsplash.com");
      expect(photo.width).toBeGreaterThan(0);
      expect(photo.height).toBeGreaterThan(0);
    }
  });
});
