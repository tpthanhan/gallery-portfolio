import { ALL_WORK, SAVED_VIEW } from "@/constants/gallery";
import type { Category, GalleryView, Photo } from "@/types/gallery";

export const filterPhotos = (
  photos: Photo[],
  category: Category,
  search: string,
  view: GalleryView,
  savedIds: string[],
) => {
  const terms = search.trim().toLowerCase().split(/\s+/).filter(Boolean);
  const saved = new Set(savedIds);
  return photos.filter((photo) => {
    if (category !== ALL_WORK && photo.category !== category) return false;
    if (view === SAVED_VIEW && !saved.has(photo.id)) return false;
    const searchable =
      `${photo.title} ${photo.category} ${photo.location} ${photo.alt}`.toLowerCase();
    return terms.every((term) => searchable.includes(term));
  });
};
