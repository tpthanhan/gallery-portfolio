import type { Photo } from "@/types/gallery";

export interface GalleryGridProps {
  photos: Photo[];
  hasFilters: boolean;
  onReset: () => void;
}
