"use client";

import { useCallback, type FC } from "react";
import Image from "next/image";
import { ArrowUpRight, X } from "lucide-react";
import { FormattedMessage, useIntl } from "react-intl";

import { useGalleryStore } from "@/stores/galleryStore";
import {
  ALL_WORK,
  CATEGORIES,
  COLLECTION_DESCRIPTIONS,
  EXPLORE_VIEW,
} from "@/constants/gallery";
import { Button } from "@/components/Button";
import { Dialog } from "@/components/Dialog";
import type { Category } from "@/types/gallery";

import type { CollectionsProps } from "./CollectionsProps";

export const Collections: FC<CollectionsProps> = ({ photos }) => {
  const isOpen = useGalleryStore((state) => state.isCollectionsOpen);
  const setOpen = useGalleryStore((state) => state.setCollectionsOpen);
  const setCategory = useGalleryStore((state) => state.setCategory);
  const setView = useGalleryStore((state) => state.setView);
  const intl = useIntl();
  const close = useCallback(() => setOpen(false), [setOpen]);
  const choose = useCallback(
    (category: Category) => {
      setView(EXPLORE_VIEW);
      setCategory(category);
      close();
      document
        .getElementById("gallery")
        ?.scrollIntoView({ behavior: "instant", block: "start" });
    },
    [close, setCategory, setView],
  );
  return (
    <Dialog
      isOpen={isOpen}
      onClose={close}
      label={intl.formatMessage({
        id: "collections.title",
        defaultMessage: "Curated collections",
      })}
      className="content-dialog"
    >
      <div className="p-6 sm:p-10">
        <div className="mb-8 flex items-start justify-between gap-4">
          <div>
            <p className="eyebrow mb-3">
              <FormattedMessage
                id="collections.eyebrow"
                defaultMessage="A few ways of seeing"
              />
            </p>
            <h2 className="font-display text-4xl tracking-tight sm:text-5xl">
              <FormattedMessage
                id="collections.heading"
                defaultMessage="Little worlds."
              />
            </h2>
          </div>
          <Button
            className="icon-button"
            onPress={close}
            aria-label={intl.formatMessage({
              id: "collections.close",
              defaultMessage: "Close collections",
            })}
          >
            <X size={21} />
          </Button>
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          {CATEGORIES.filter((category) => category !== ALL_WORK).map(
            (category) => {
              const collection = photos.filter(
                (photo) => photo.category === category,
              );
              const cover = collection[0];
              return (
                <Button
                  key={category}
                  className="group text-left disabled:opacity-40"
                  onPress={() => choose(category)}
                  isDisabled={cover == null}
                >
                  <div className="relative mb-3 aspect-[1.7] overflow-hidden rounded-xl bg-surface-strong">
                    {cover != null && (
                      <Image
                        src={cover.src}
                        alt={cover.alt}
                        fill
                        unoptimized
                        sizes="400px"
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    )}
                    <span className="photo-scrim absolute inset-0" />
                    <span className="absolute right-3 bottom-3 flex size-8 items-center justify-center rounded-full bg-accent text-ink transition-transform group-hover:rotate-45">
                      <ArrowUpRight size={17} />
                    </span>
                    <span className="absolute bottom-4 left-4 text-xs text-on-image">
                      <FormattedMessage
                        id="collections.count"
                        defaultMessage="{count, plural, one {# moment} other {# moments}}"
                        values={{ count: collection.length }}
                      />
                    </span>
                  </div>
                  <h3 className="text-lg font-medium">{category}</h3>
                  <p className="mt-1 text-xs text-muted">
                    {
                      COLLECTION_DESCRIPTIONS[
                        category as Exclude<Category, "All work">
                      ]
                    }
                  </p>
                </Button>
              );
            },
          )}
        </div>
      </div>
    </Dialog>
  );
};
