"use client";

import {
  useCallback,
  useDeferredValue,
  useEffect,
  useRef,
  type FC,
} from "react";
import { Input } from "@heroui/react";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowUp,
  ArrowUpRight,
  Asterisk,
  Grid2X2,
  Grid3X3,
  LoaderCircle,
  Search,
  X,
} from "lucide-react";
import { motion } from "motion/react";
import { FormattedMessage, useIntl } from "react-intl";

import { useGalleryStore } from "@/stores/galleryStore";
import {
  ALL_WORK,
  CATEGORIES,
  COMFORTABLE_DENSITY,
  COMPACT_DENSITY,
  DEMO_MODE,
  EXPLORE_VIEW,
  GALLERY_QUERY_KEY,
  PHOTO_QUERY_PARAM,
  SAVED_VIEW,
} from "@/constants/gallery";
import { About } from "@/components/About";
import { Button } from "@/components/Button";
import { Collections } from "@/components/Collections";
import { GalleryGrid } from "@/components/GalleryGrid";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { Lightbox } from "@/components/Lightbox";
import { getGallery } from "@/app/actions/gallery";
import { filterPhotos } from "@/lib/filterPhotos";
import type { Photo } from "@/types/gallery";

import type { GalleryProps } from "./GalleryProps";

const EMPTY_PHOTOS: Photo[] = [];

export const Gallery: FC<GalleryProps> = ({ initialResult }) => {
  const category = useGalleryStore((state) => state.category);
  const setCategory = useGalleryStore((state) => state.setCategory);
  const search = useGalleryStore((state) => state.search);
  const setSearch = useGalleryStore((state) => state.setSearch);
  const view = useGalleryStore((state) => state.view);
  const setView = useGalleryStore((state) => state.setView);
  const density = useGalleryStore((state) => state.density);
  const setDensity = useGalleryStore((state) => state.setDensity);
  const savedIds = useGalleryStore((state) => state.savedIds);
  const selectPhoto = useGalleryStore((state) => state.selectPhoto);
  const setAboutOpen = useGalleryStore((state) => state.setAboutOpen);
  const deferredSearch = useDeferredValue(search);
  const hasReadLink = useRef(false);
  const intl = useIntl();
  const query = useQuery({
    queryKey: GALLERY_QUERY_KEY,
    queryFn: async () => {
      const result = await getGallery();
      if (!result.success) throw new Error(result.message);
      return result.data;
    },
    initialData: initialResult.success ? initialResult.data : undefined,
  });
  const photos = query.data?.photos ?? EMPTY_PHOTOS;
  const photographer = query.data?.photographer ?? "";
  const isDemo = query.data?.mode === DEMO_MODE;
  const filtered = filterPhotos(
    photos,
    category,
    deferredSearch,
    view,
    savedIds,
  );
  const hasFilters = category !== ALL_WORK || search.trim().length > 0;
  const reset = useCallback(() => setView(EXPLORE_VIEW), [setView]);
  useEffect(() => {
    void useGalleryStore.persist.rehydrate();
  }, []);
  useEffect(() => {
    if (hasReadLink.current || query.data == null) return;
    hasReadLink.current = true;
    const id = new URL(window.location.href).searchParams.get(
      PHOTO_QUERY_PARAM,
    );
    if (id != null && photos.some((photo) => photo.id === id)) selectPhoto(id);
  }, [photos, query.data, selectPhoto]);
  return (
    <div id="top" className="min-h-screen">
      <a href="#gallery" className="skip-link">
        <FormattedMessage id="skip" defaultMessage="Skip to gallery" />
      </a>
      <Header />
      <main className="page-shell">
        <Hero photos={photos} photographer={photographer} />
        <section
          id="gallery"
          aria-label={intl.formatMessage({
            id: "gallery.label",
            defaultMessage: "Photo gallery",
          })}
          className="scroll-mt-6 pb-12"
        >
          <div className="mb-5 flex items-center gap-3 rounded-full border border-line bg-surface px-4 py-3 md:hidden">
            <Search size={16} className="text-muted" />
            <label htmlFor="mobile-search" className="sr-only">
              <FormattedMessage
                id="search.label"
                defaultMessage="Search photos"
              />
            </label>
            <Input
              id="mobile-search"
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={intl.formatMessage({
                id: "search.mobile",
                defaultMessage: "Find a place, a feeling, a moment...",
              })}
              className="still-search-input min-w-0 flex-1 bg-transparent text-xs outline-none placeholder:text-muted"
            />
            {search.length > 0 && (
              <Button
                onPress={() => setSearch("")}
                aria-label={intl.formatMessage({
                  id: "search.clear",
                  defaultMessage: "Clear search",
                })}
              >
                <X size={15} />
              </Button>
            )}
          </div>
          <div className="mb-7 flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
            <div
              className="-mr-1 no-scrollbar flex items-center gap-1 overflow-x-auto py-1 pr-1"
              role="group"
              aria-label={intl.formatMessage({
                id: "filter.label",
                defaultMessage: "Filter by category",
              })}
            >
              {CATEGORIES.map((item) => (
                <Button
                  key={item}
                  onPress={() => setCategory(item)}
                  aria-pressed={category === item}
                  className={`relative isolate shrink-0 rounded-full px-4 py-2.5 text-[11px] font-medium transition-colors duration-300 ${category === item ? "text-background" : "text-muted hover:bg-surface-strong hover:text-ink"}`}
                >
                  {category === item && (
                    <motion.span
                      layoutId="category-pill"
                      className="absolute inset-0 -z-10 rounded-full bg-ink"
                      transition={{
                        type: "spring",
                        stiffness: 380,
                        damping: 32,
                      }}
                    />
                  )}
                  {item}
                  {item === ALL_WORK && (
                    <span
                      className={`ml-1.5 text-[9px] ${category === item ? "text-background/55" : "text-muted"}`}
                    >
                      {view === SAVED_VIEW
                        ? photos.filter((photo) => savedIds.includes(photo.id))
                            .length
                        : photos.length}
                    </span>
                  )}
                </Button>
              ))}
            </div>
            <div className="flex shrink-0 items-center justify-between gap-5 sm:justify-end">
              <p className="text-[10px] text-muted" aria-live="polite">
                <FormattedMessage
                  id="gallery.count"
                  defaultMessage="{count, plural, one {# moment} other {# moments}}"
                  values={{ count: filtered.length }}
                />
                {view === SAVED_VIEW && (
                  <span>
                    {" "}
                    <FormattedMessage
                      id="gallery.savedSuffix"
                      defaultMessage="saved"
                    />
                  </span>
                )}
              </p>
              <div
                className="flex items-center gap-0.5 border-l border-line pl-4"
                role="group"
                aria-label={intl.formatMessage({
                  id: "layout.label",
                  defaultMessage: "Gallery layout",
                })}
              >
                <Button
                  className={`layout-button ${density === COMFORTABLE_DENSITY ? "is-active" : ""}`}
                  onPress={() => setDensity(COMFORTABLE_DENSITY)}
                  aria-pressed={density === COMFORTABLE_DENSITY}
                  aria-label={intl.formatMessage({
                    id: "layout.comfortable",
                    defaultMessage: "Comfortable grid",
                  })}
                >
                  <Grid2X2 size={16} strokeWidth={1.6} />
                </Button>
                <Button
                  className={`layout-button ${density === COMPACT_DENSITY ? "is-active" : ""}`}
                  onPress={() => setDensity(COMPACT_DENSITY)}
                  aria-pressed={density === COMPACT_DENSITY}
                  aria-label={intl.formatMessage({
                    id: "layout.compact",
                    defaultMessage: "Compact grid",
                  })}
                >
                  <Grid3X3 size={16} strokeWidth={1.6} />
                </Button>
              </div>
            </div>
          </div>
          {(hasFilters || view === SAVED_VIEW) && (
            <div className="mb-6 flex items-center gap-3 text-xs">
              <span>
                {view === SAVED_VIEW ? (
                  <FormattedMessage
                    id="gallery.savedHeading"
                    defaultMessage="Your little collection"
                  />
                ) : (
                  <FormattedMessage
                    id="gallery.results"
                    defaultMessage="A closer look"
                  />
                )}
                {search.trim().length > 0 && (
                  <span className="text-muted"> · “{search.trim()}”</span>
                )}
              </span>
              <Button
                onPress={reset}
                className="flex items-center gap-1 rounded-full bg-surface-strong px-2.5 py-1 text-[10px] text-muted"
              >
                <FormattedMessage id="gallery.reset" defaultMessage="Reset" />
                <X size={10} />
              </Button>
            </div>
          )}
          {query.isPending ? (
            <div
              className="flex min-h-80 flex-col items-center justify-center gap-4"
              role="status"
            >
              <LoaderCircle className="animate-spin text-muted" size={26} />
              <p className="text-sm text-muted">
                <FormattedMessage
                  id="gallery.loading"
                  defaultMessage="Gathering a little inspiration..."
                />
              </p>
            </div>
          ) : query.isError ? (
            <div
              className="rounded-2xl border border-line bg-surface p-12 text-center"
              role="alert"
            >
              <h2 className="font-display text-3xl">
                <FormattedMessage
                  id="gallery.errorTitle"
                  defaultMessage="A brief intermission."
                />
              </h2>
              <p className="mt-4 text-sm text-muted">{query.error.message}</p>
              <Button
                className="mt-6 rounded-full bg-ink px-6 py-3 text-xs text-background"
                onPress={() => void query.refetch()}
                isDisabled={query.isFetching}
              >
                <FormattedMessage
                  id="gallery.retry"
                  defaultMessage="Try again"
                />
              </Button>
            </div>
          ) : (
            <GalleryGrid
              key={`${category}:${deferredSearch}:${view}`}
              photos={filtered}
              hasFilters={hasFilters}
              onReset={reset}
            />
          )}
        </section>
        <section className="relative mt-6 mb-14 flex flex-col items-start justify-between gap-8 overflow-hidden rounded-2xl bg-surface-strong px-7 py-9 sm:flex-row sm:items-center sm:px-10 sm:py-10">
          <div className="relative z-10">
            <p className="eyebrow mb-3">
              <FormattedMessage
                id="footer.bannerEyebrow"
                defaultMessage="A reminder, from one wanderer to another"
              />
            </p>
            <h2 className="font-display text-3xl tracking-tight sm:text-4xl">
              <FormattedMessage
                id="footer.banner"
                defaultMessage="There's beauty in paying attention."
              />
            </h2>
          </div>
          <Button
            onPress={() => setAboutOpen(true)}
            className="group relative z-10 flex shrink-0 items-center gap-3 text-xs font-medium"
          >
            <FormattedMessage
              id="footer.behind"
              defaultMessage="Behind the lens"
            />
            <span className="flex size-10 items-center justify-center rounded-full bg-accent transition-transform duration-300 group-hover:rotate-45">
              <ArrowUpRight size={18} />
            </span>
          </Button>
          <Asterisk
            size={230}
            strokeWidth={0.6}
            className="pointer-events-none absolute top-[-65px] right-36 rotate-12 text-ink/[0.035]"
          />
        </section>
      </main>
      <footer className="page-shell flex flex-col items-start justify-between gap-6 border-t border-line pt-7 pb-8 sm:flex-row sm:items-center">
        <div className="flex items-center gap-5">
          <a href="#top" className="wordmark text-3xl" aria-label="Back to top">
            still<span className="logo-dot">.</span>
          </a>
          <p className="text-[10px] text-muted">
            © {new Date().getFullYear()} {photographer}
            <span className="mx-2">·</span>
            <FormattedMessage
              id="footer.made"
              defaultMessage="Made to be felt."
            />
          </p>
        </div>
        <div className="flex items-center gap-6">
          <span className="flex items-center gap-1.5 text-[9px] text-muted">
            <span className="size-1.5 rounded-full bg-green" />
            {isDemo ? (
              <FormattedMessage
                id="footer.demo"
                defaultMessage="A demo, full of possibility"
              />
            ) : (
              <FormattedMessage
                id="footer.drive"
                defaultMessage="A living archive"
              />
            )}
          </span>
          <a href="#top" className="group flex items-center gap-2 text-[10px]">
            <FormattedMessage id="footer.top" defaultMessage="Back to top" />
            <ArrowUp
              size={12}
              className="transition-transform group-hover:-translate-y-1"
            />
          </a>
        </div>
      </footer>
      <Lightbox
        photos={filtered}
        allPhotos={photos}
        photographer={photographer}
      />
      <Collections photos={photos} />
      <About photographer={photographer} isDemo={isDemo} />
    </div>
  );
};
