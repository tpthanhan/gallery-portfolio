import type { Category } from "@/types/gallery";

export const CATEGORIES: Category[] = [
  "All work",
  "Nature",
  "Architecture",
  "Street",
  "Travel",
  "Portraits",
];
export const GALLERY_QUERY_KEY = ["gallery"] as const;
export const INITIAL_VISIBLE_COUNT = 16;
export const LOAD_MORE_COUNT = 12;
export const GALLERY_STALE_TIME = 30 * 60 * 1000;
export const FAVORITES_STORAGE_KEY = "still-favorites-v1";
export const EXPLORE_VIEW = "explore";
export const SAVED_VIEW = "saved";
export const COMFORTABLE_DENSITY = "comfortable";
export const COMPACT_DENSITY = "compact";
export const ALL_WORK: Category = "All work";
export const DEMO_MODE = "demo";
export const DRIVE_MODE = "drive";
export const PHOTO_QUERY_PARAM = "photo";
export const COLLECTION_DESCRIPTIONS: Record<
  Exclude<Category, "All work">,
  string
> = {
  Nature: "Where the world slows down.",
  Architecture: "Lines, light, and everything between.",
  Street: "Ordinary moments. Extraordinary stories.",
  Travel: "A little further from familiar.",
  Portraits: "The stories in a face.",
};
