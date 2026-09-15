"use client";

import { useEffect, useRef, type FC } from "react";
import Link from "next/link";
import { Input } from "@heroui/react";
import { Bookmark, Search, X } from "lucide-react";
import { FormattedMessage, useIntl } from "react-intl";

import { useGalleryStore } from "@/stores/galleryStore";
import { EXPLORE_VIEW, SAVED_VIEW } from "@/constants/gallery";
import { Button } from "@/components/Button";

export const Header: FC = () => {
  const view = useGalleryStore((state) => state.view);
  const setView = useGalleryStore((state) => state.setView);
  const search = useGalleryStore((state) => state.search);
  const setSearch = useGalleryStore((state) => state.setSearch);
  const savedIds = useGalleryStore((state) => state.savedIds);
  const setCollectionsOpen = useGalleryStore(
    (state) => state.setCollectionsOpen,
  );
  const setAboutOpen = useGalleryStore((state) => state.setAboutOpen);
  const searchRef = useRef<HTMLInputElement>(null);
  const intl = useIntl();
  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      const target = event.target;
      const isTyping =
        target instanceof HTMLElement &&
        (target.isContentEditable ||
          ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName));
      if (
        event.key === "/" &&
        !isTyping &&
        document.querySelector('[role="dialog"]') == null
      ) {
        event.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);
  return (
    <header className="relative z-20 border-b border-line">
      <div className="page-shell flex min-h-24 flex-wrap items-center justify-between gap-x-8 gap-y-4 py-5 lg:flex-nowrap">
        <Link
          href="/"
          onClick={() => setView(EXPLORE_VIEW)}
          aria-label={intl.formatMessage({
            id: "nav.home",
            defaultMessage: "Still home",
          })}
          className="flex shrink-0 items-center gap-3"
        >
          <span className="wordmark">
            still<span className="logo-dot">.</span>
          </span>
          <span className="hidden border-l border-line pl-3 text-[8px] leading-[1.6] font-semibold tracking-[0.17em] uppercase xl:block">
            <FormattedMessage
              id="nav.tagline"
              defaultMessage="The visual{break}journal"
              values={{ break: <br /> }}
            />
          </span>
        </Link>
        <nav
          aria-label={intl.formatMessage({
            id: "nav.label",
            defaultMessage: "Main navigation",
          })}
          className="order-3 flex w-full items-center justify-center gap-8 text-xs font-medium sm:order-none sm:w-auto"
        >
          <Button
            className={`nav-link ${view === EXPLORE_VIEW ? "is-active" : ""}`}
            onPress={() => setView(EXPLORE_VIEW)}
            aria-current={view === EXPLORE_VIEW ? "page" : undefined}
          >
            <FormattedMessage id="nav.explore" defaultMessage="Explore" />
          </Button>
          <Button className="nav-link" onPress={() => setCollectionsOpen(true)}>
            <FormattedMessage
              id="nav.collections"
              defaultMessage="Collections"
            />
            <span className="ml-1 align-top text-[8px] text-muted">05</span>
          </Button>
          <Button className="nav-link" onPress={() => setAboutOpen(true)}>
            <FormattedMessage id="nav.about" defaultMessage="About" />
          </Button>
        </nav>
        <div className="flex items-center gap-3">
          <div className="hidden items-center gap-2.5 rounded-full border border-line bg-surface/70 py-2.5 pr-3 pl-3.5 md:flex">
            <Search size={15} className="text-muted" />
            <label htmlFor="gallery-search" className="sr-only">
              <FormattedMessage
                id="search.label"
                defaultMessage="Search photos"
              />
            </label>
            <Input
              ref={searchRef}
              id="gallery-search"
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={intl.formatMessage({
                id: "search.placeholder",
                defaultMessage: "Find a little inspiration...",
              })}
              className="still-search-input w-40 bg-transparent text-[11px] outline-none placeholder:text-muted lg:w-44"
            />
            {search.length > 0 ? (
              <Button
                onPress={() => setSearch("")}
                aria-label={intl.formatMessage({
                  id: "search.clear",
                  defaultMessage: "Clear search",
                })}
              >
                <X size={13} />
              </Button>
            ) : (
              <kbd className="flex size-4 items-center justify-center rounded border border-line text-[9px] text-muted">
                /
              </kbd>
            )}
          </div>
          <Button
            className={`saved-nav flex h-10 items-center gap-2 rounded-full border px-4 text-[11px] font-medium transition-all duration-300 ${view === SAVED_VIEW ? "border-ink bg-ink text-background" : "border-line hover:border-ink"}`}
            onPress={() =>
              setView(view === SAVED_VIEW ? EXPLORE_VIEW : SAVED_VIEW)
            }
            aria-pressed={view === SAVED_VIEW}
          >
            <Bookmark
              size={14}
              fill={view === SAVED_VIEW ? "currentColor" : "none"}
            />
            <FormattedMessage id="nav.saved" defaultMessage="Saved" />
            {savedIds.length > 0 && (
              <span className="flex size-4 items-center justify-center rounded-full bg-accent text-[9px] text-ink">
                {savedIds.length}
              </span>
            )}
          </Button>
        </div>
      </div>
    </header>
  );
};
