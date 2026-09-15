"use client";

import { useState, type FC } from "react";
import {
  ArrowDown,
  ArrowUpRight,
  Bookmark,
  Search,
  Sparkles,
} from "lucide-react";
import { motion } from "motion/react";
import { FormattedMessage } from "react-intl";

import { useGalleryStore } from "@/stores/galleryStore";
import {
  COMPACT_DENSITY,
  INITIAL_VISIBLE_COUNT,
  LOAD_MORE_COUNT,
  SAVED_VIEW,
} from "@/constants/gallery";
import { Button } from "@/components/Button";
import { PhotoCard } from "@/components/PhotoCard";

import type { GalleryGridProps } from "./GalleryGridProps";

export const GalleryGrid: FC<GalleryGridProps> = ({
  photos,
  hasFilters,
  onReset,
}) => {
  const density = useGalleryStore((state) => state.density);
  const savedIds = useGalleryStore((state) => state.savedIds);
  const selectPhoto = useGalleryStore((state) => state.selectPhoto);
  const toggleSaved = useGalleryStore((state) => state.toggleSaved);
  const view = useGalleryStore((state) => state.view);
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE_COUNT);
  const remaining = Math.max(0, photos.length - visibleCount);
  const isSavedView = view === SAVED_VIEW;
  if (photos.length === 0)
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex min-h-80 flex-col items-center justify-center rounded-2xl border border-dashed border-line bg-surface/50 px-6 py-16 text-center"
      >
        <div className="mb-5 flex size-14 items-center justify-center rounded-full bg-accent">
          {isSavedView && !hasFilters ? (
            <Bookmark size={23} strokeWidth={1.4} />
          ) : (
            <Search size={23} strokeWidth={1.4} />
          )}
        </div>
        <h3 className="font-display text-3xl tracking-tight">
          <FormattedMessage
            id={
              isSavedView && !hasFilters
                ? "empty.savedTitle"
                : "empty.searchTitle"
            }
            defaultMessage={
              isSavedView && !hasFilters
                ? "Keep a little inspiration."
                : "A little too far off the beaten path."
            }
          />
        </h3>
        <p className="mt-3 max-w-sm text-sm leading-6 text-muted">
          <FormattedMessage
            id={
              isSavedView && !hasFilters
                ? "empty.savedDescription"
                : "empty.searchDescription"
            }
            defaultMessage={
              isSavedView && !hasFilters
                ? "Tap the bookmark on any photo to start your own collection. Your favorites stay saved in this browser."
                : "No moments found. Try a different search, or wander back to the full collection."
            }
          />
        </p>
        <Button
          onPress={onReset}
          className="mt-6 flex items-center gap-2 border-b border-ink pb-1 text-xs font-medium"
        >
          <FormattedMessage
            id="empty.reset"
            defaultMessage="Explore all moments"
          />
          <ArrowUpRight size={14} />
        </Button>
      </motion.div>
    );
  return (
    <div>
      <div
        className={`masonry-grid gap-5 ${density === COMPACT_DENSITY ? "columns-2 md:columns-3 lg:columns-4 2xl:columns-5" : "columns-1 sm:columns-2 lg:columns-3 xl:columns-4"}`}
      >
        {photos.slice(0, visibleCount).map((photo, index) => (
          <PhotoCard
            key={photo.id}
            photo={photo}
            index={index}
            isSaved={savedIds.includes(photo.id)}
            onOpen={selectPhoto}
            onSave={toggleSaved}
          />
        ))}
      </div>
      <div className="flex flex-col items-center pt-10 pb-4">
        {remaining > 0 ? (
          <Button
            className="group flex items-center gap-4 rounded-full border border-ink px-7 py-3.5 text-xs font-medium transition-all duration-300 hover:bg-ink hover:text-background active:scale-95"
            onPress={() => setVisibleCount((count) => count + LOAD_MORE_COUNT)}
          >
            <FormattedMessage
              id="gallery.more"
              defaultMessage="A little more inspiration"
            />
            <span className="flex size-5 items-center justify-center rounded-full bg-accent text-ink">
              <ArrowDown
                size={12}
                className="transition-transform group-hover:translate-y-0.5"
              />
            </span>
          </Button>
        ) : (
          <div className="flex flex-col items-center gap-3 text-center">
            <Sparkles size={20} strokeWidth={1.3} className="text-muted" />
            <p className="font-display text-xl italic">
              <FormattedMessage
                id="gallery.end"
                defaultMessage="A little pause. A little perspective."
              />
            </p>
          </div>
        )}
        <p className="mt-4 text-[10px] text-muted">
          <FormattedMessage
            id="gallery.progress"
            defaultMessage="{shown} of {total} moments explored"
            values={{
              shown: Math.min(visibleCount, photos.length),
              total: photos.length,
            }}
          />
        </p>
      </div>
    </div>
  );
};
