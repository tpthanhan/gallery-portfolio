import { create } from "zustand";
import { persist } from "zustand/middleware";

import {
  ALL_WORK,
  COMFORTABLE_DENSITY,
  EXPLORE_VIEW,
  FAVORITES_STORAGE_KEY,
} from "@/constants/gallery";
import type { GalleryState } from "@/types/gallery";

export const useGalleryStore = create<GalleryState>()(
  persist(
    (set) => ({
      category: ALL_WORK,
      search: "",
      view: EXPLORE_VIEW,
      density: COMFORTABLE_DENSITY,
      savedIds: [],
      selectedId: null,
      isCollectionsOpen: false,
      isAboutOpen: false,
      setCategory: (category) => set({ category }),
      setSearch: (search) => set({ search }),
      setView: (view) => set({ view, category: ALL_WORK, search: "" }),
      setDensity: (density) => set({ density }),
      toggleSaved: (id) =>
        set((state) => ({
          savedIds: state.savedIds.includes(id)
            ? state.savedIds.filter((savedId) => savedId !== id)
            : [...state.savedIds, id],
        })),
      selectPhoto: (selectedId) => set({ selectedId }),
      setCollectionsOpen: (isCollectionsOpen) => set({ isCollectionsOpen }),
      setAboutOpen: (isAboutOpen) => set({ isAboutOpen }),
    }),
    {
      name: FAVORITES_STORAGE_KEY,
      partialize: (state) => ({ savedIds: state.savedIds }),
      skipHydration: true,
      merge: (persisted, current) => {
        const saved = persisted as { savedIds?: unknown } | undefined;
        const savedIds = Array.isArray(saved?.savedIds)
          ? saved.savedIds
              .filter((id): id is string => typeof id === "string")
              .slice(0, 500)
          : [];
        return { ...current, savedIds };
      },
    },
  ),
);
