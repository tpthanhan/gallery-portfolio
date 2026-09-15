"use client";

import { useCallback, useEffect, useState, type FC } from "react";
import Image from "next/image";
import {
  ArrowDownLeft,
  ArrowLeft,
  ArrowRight,
  Bookmark,
  Check,
  Copy,
  ImageOff,
  MapPin,
  X,
} from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { FormattedMessage, useIntl } from "react-intl";

import { useGalleryStore } from "@/stores/galleryStore";
import { PHOTO_QUERY_PARAM } from "@/constants/gallery";
import { Button } from "@/components/Button";
import { Dialog } from "@/components/Dialog";

import type { LightboxProps } from "./LightboxProps";

export const Lightbox: FC<LightboxProps> = ({
  photos,
  allPhotos,
  photographer,
}) => {
  const selectedId = useGalleryStore((state) => state.selectedId);
  const selectPhoto = useGalleryStore((state) => state.selectPhoto);
  const savedIds = useGalleryStore((state) => state.savedIds);
  const toggleSaved = useGalleryStore((state) => state.toggleSaved);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [shareError, setShareError] = useState(false);
  const [failedId, setFailedId] = useState<string | null>(null);
  const reduceMotion = useReducedMotion();
  const intl = useIntl();
  const photo = allPhotos.find((item) => item.id === selectedId);
  const index = photos.findIndex((item) => item.id === selectedId);
  const isSaved = photo != null && savedIds.includes(photo.id);
  const close = useCallback(() => {
    selectPhoto(null);
    const url = new URL(window.location.href);
    url.searchParams.delete(PHOTO_QUERY_PARAM);
    window.history.replaceState(null, "", url);
  }, [selectPhoto]);
  const navigate = useCallback(
    (direction: number) => {
      if (photos.length < 2) return;
      const nextIndex =
        (Math.max(index, 0) + direction + photos.length) % photos.length;
      selectPhoto(photos[nextIndex].id);
      setShareError(false);
    },
    [index, photos, selectPhoto],
  );
  useEffect(() => {
    if (photo == null) return;
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        navigate(-1);
      }
      if (event.key === "ArrowRight") {
        event.preventDefault();
        navigate(1);
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [navigate, photo]);
  useEffect(() => {
    if (photo == null) return;
    const url = new URL(window.location.href);
    url.searchParams.set(PHOTO_QUERY_PARAM, photo.id);
    window.history.replaceState(null, "", url);
  }, [photo]);
  useEffect(() => {
    if (copiedId == null) return;
    const timer = window.setTimeout(() => setCopiedId(null), 2400);
    return () => window.clearTimeout(timer);
  }, [copiedId]);
  const share = useCallback(async () => {
    if (photo == null) return;
    try {
      const url = new URL(window.location.href);
      url.searchParams.set(PHOTO_QUERY_PARAM, photo.id);
      await navigator.clipboard.writeText(url.toString());
      setCopiedId(photo.id);
      setShareError(false);
    } catch {
      setShareError(true);
    }
  }, [photo]);
  return (
    <Dialog
      isOpen={photo != null}
      onClose={close}
      label={intl.formatMessage({
        id: "viewer.title",
        defaultMessage: "Photo viewer",
      })}
      className="lightbox-dialog"
    >
      {photo != null && (
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between px-5 py-4 sm:px-8">
            <span className="flex items-center gap-2 text-sm font-medium">
              <span className="brand-symbol text-xl">s.</span>
              <span className="text-on-image/45">/</span>
              <FormattedMessage
                id="viewer.journal"
                defaultMessage="The visual journal"
              />
            </span>
            <Button
              className="icon-button text-on-image hover:bg-on-image/10"
              onPress={close}
              aria-label={intl.formatMessage({
                id: "viewer.close",
                defaultMessage: "Close photo viewer",
              })}
            >
              <X size={22} />
            </Button>
          </div>
          <div className="relative flex min-h-0 flex-1 items-center justify-center px-4 sm:px-20">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={photo.id}
                initial={{ opacity: 0, scale: reduceMotion ? 1 : 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: reduceMotion ? 1 : 0.99 }}
                transition={{ duration: 0.22 }}
                className="relative h-full min-h-64 w-full"
              >
                {failedId !== photo.id ? (
                  <Image
                    src={photo.src}
                    alt={photo.alt}
                    fill
                    unoptimized
                    sizes="100vw"
                    className="object-contain"
                    onError={() => setFailedId(photo.id)}
                  />
                ) : (
                  <div className="flex h-full flex-col items-center justify-center gap-4 text-on-image/60">
                    <ImageOff size={38} />
                    <FormattedMessage
                      id="viewer.error"
                      defaultMessage="This image is temporarily unavailable."
                    />
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
            {photos.length > 1 && (
              <div className="pointer-events-none absolute inset-x-2 top-1/2 flex -translate-y-1/2 justify-between sm:inset-x-5">
                <Button
                  className="viewer-arrow pointer-events-auto"
                  onPress={() => navigate(-1)}
                  aria-label={intl.formatMessage({
                    id: "viewer.previous",
                    defaultMessage: "Previous photo",
                  })}
                >
                  <ArrowLeft size={21} />
                </Button>
                <Button
                  className="viewer-arrow pointer-events-auto"
                  onPress={() => navigate(1)}
                  aria-label={intl.formatMessage({
                    id: "viewer.next",
                    defaultMessage: "Next photo",
                  })}
                >
                  <ArrowRight size={21} />
                </Button>
              </div>
            )}
          </div>
          <div className="flex flex-col justify-between gap-5 px-5 py-6 sm:flex-row sm:items-end sm:px-8">
            <div>
              <p className="mb-2 text-[10px] tracking-[0.18em] text-on-image/45 uppercase">
                {photo.category} <span className="mx-2">/</span>{" "}
                {index >= 0
                  ? intl.formatNumber(index + 1, { minimumIntegerDigits: 2 })
                  : "—"}{" "}
                <FormattedMessage id="viewer.of" defaultMessage="of" />{" "}
                {intl.formatNumber(photos.length, { minimumIntegerDigits: 2 })}
              </p>
              <h2 className="text-2xl font-medium tracking-tight sm:text-3xl">
                {photo.title}
              </h2>
              <p className="mt-2 flex items-center gap-1.5 text-xs text-on-image/55">
                <MapPin size={12} />
                {photo.location}
                <span className="mx-1">·</span>
                {photographer}
              </p>
            </div>
            <div className="flex flex-col items-start gap-2 sm:items-end">
              <div className="flex gap-2">
                <Button className="viewer-action" onPress={share}>
                  {copiedId === photo.id ? (
                    <Check size={15} />
                  ) : (
                    <Copy size={15} />
                  )}
                  <FormattedMessage
                    id={copiedId === photo.id ? "viewer.copied" : "viewer.copy"}
                    defaultMessage={
                      copiedId === photo.id ? "Link copied" : "Copy link"
                    }
                  />
                </Button>
                <Button
                  className={`viewer-action ${isSaved ? "is-saved" : ""}`}
                  aria-pressed={isSaved}
                  onPress={() => toggleSaved(photo.id)}
                >
                  <Bookmark
                    size={15}
                    fill={isSaved ? "currentColor" : "none"}
                  />
                  <FormattedMessage
                    id={isSaved ? "viewer.saved" : "viewer.save"}
                    defaultMessage={isSaved ? "Saved" : "Save moment"}
                  />
                </Button>
              </div>
              <p className="text-[10px] text-on-image/40" aria-live="polite">
                {shareError ? (
                  <FormattedMessage
                    id="viewer.copyError"
                    defaultMessage="Clipboard unavailable. Please copy the page URL instead."
                  />
                ) : (
                  <span className="hidden items-center gap-1.5 sm:flex">
                    <ArrowDownLeft size={11} />
                    <FormattedMessage
                      id="viewer.shortcuts"
                      defaultMessage="Arrow keys to explore · Esc to return"
                    />
                  </span>
                )}
              </p>
            </div>
          </div>
        </div>
      )}
    </Dialog>
  );
};
