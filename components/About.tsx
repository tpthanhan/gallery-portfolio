"use client";

import { useCallback, type FC } from "react";
import { Aperture, ArrowUpRight, X } from "lucide-react";
import { FormattedMessage, useIntl } from "react-intl";

import { useGalleryStore } from "@/stores/galleryStore";
import { Button } from "@/components/Button";
import { Dialog } from "@/components/Dialog";

import type { AboutProps } from "./AboutProps";

export const About: FC<AboutProps> = ({ photographer, isDemo }) => {
  const isOpen = useGalleryStore((state) => state.isAboutOpen);
  const setOpen = useGalleryStore((state) => state.setAboutOpen);
  const close = useCallback(() => setOpen(false), [setOpen]);
  const intl = useIntl();
  return (
    <Dialog
      isOpen={isOpen}
      onClose={close}
      label={intl.formatMessage({
        id: "about.title",
        defaultMessage: "About Still",
      })}
      className="about-dialog"
    >
      <div className="relative p-7 sm:p-12">
        <Button
          className="icon-button absolute top-5 right-5"
          onPress={close}
          aria-label={intl.formatMessage({
            id: "about.close",
            defaultMessage: "Close about",
          })}
        >
          <X size={21} />
        </Button>
        <div className="mb-8 flex size-16 items-center justify-center rounded-full bg-accent">
          <Aperture size={30} strokeWidth={1.3} />
        </div>
        <p className="eyebrow mb-4">
          <FormattedMessage
            id="about.eyebrow"
            defaultMessage="Behind the lens"
          />
        </p>
        <h2 className="font-display text-5xl leading-[1.05] tracking-tight">
          <FormattedMessage
            id="about.heading"
            defaultMessage="Less noise.{break}More wonder."
            values={{ break: <br /> }}
          />
        </h2>
        <p className="mt-6 text-sm leading-7 text-muted">
          <FormattedMessage
            id="about.description"
            defaultMessage="Still is a home for the moments we almost walk past. A collection of places, people, and small wonders — seen through a curious lens."
          />
        </p>
        <div className="mt-8 border-t border-line pt-6">
          <p className="font-medium">{photographer}</p>
          <p className="mt-1 text-xs text-muted">
            <FormattedMessage
              id="about.role"
              defaultMessage="Photographer. Wanderer. Perpetually curious."
            />
          </p>
        </div>
        {isDemo && (
          <div className="mt-8 rounded-xl bg-surface-strong p-4 text-xs leading-6 text-muted">
            <FormattedMessage
              id="about.demo"
              defaultMessage="You're exploring the demo collection. Photography is sourced from Unsplash; titles, locations, and the photographer name are illustrative. Connect your Google Drive to make this space your own."
            />
            <a
              href="https://unsplash.com"
              target="_blank"
              rel="noreferrer"
              className="mt-2 flex w-fit items-center gap-1 font-medium text-ink underline underline-offset-4"
            >
              <FormattedMessage
                id="about.unsplash"
                defaultMessage="Discover Unsplash"
              />
              <ArrowUpRight size={13} />
            </a>
          </div>
        )}
      </div>
    </Dialog>
  );
};
