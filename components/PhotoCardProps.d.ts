import type { Photo } from "@/types/gallery";

export interface PhotoCardProps {
  photo: Photo;
  index: number;
  isSaved: boolean;
  onOpen: (id: string) => void;
  onSave: (id: string) => void;
}
