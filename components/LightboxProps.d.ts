import type { Photo } from "@/types/gallery";

export interface LightboxProps {
  photos: Photo[];
  allPhotos: Photo[];
  photographer: string;
}
