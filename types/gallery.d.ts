export type Category =
  "All work" | "Nature" | "Architecture" | "Street" | "Travel" | "Portraits";

export interface Photo {
  id: string;
  title: string;
  alt: string;
  category: Exclude<Category, "All work">;
  location: string;
  src: string;
  width: number;
  height: number;
  color: string;
}

export interface GalleryData {
  photos: Photo[];
  mode: "demo" | "drive";
  photographer: string;
}

export type GalleryResult =
  { success: true; data: GalleryData } | { success: false; message: string };

export type GalleryView = "explore" | "saved";
export type GridDensity = "comfortable" | "compact";

export interface GalleryState {
  category: Category;
  search: string;
  view: GalleryView;
  density: GridDensity;
  savedIds: string[];
  selectedId: string | null;
  isCollectionsOpen: boolean;
  isAboutOpen: boolean;
  setCategory: (category: Category) => void;
  setSearch: (search: string) => void;
  setView: (view: GalleryView) => void;
  setDensity: (density: GridDensity) => void;
  toggleSaved: (id: string) => void;
  selectPhoto: (id: string | null) => void;
  setCollectionsOpen: (isOpen: boolean) => void;
  setAboutOpen: (isOpen: boolean) => void;
}
