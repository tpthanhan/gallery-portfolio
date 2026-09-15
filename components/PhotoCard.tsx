"use client";

import { useState, type FC } from "react";
import Image from "next/image";
import { ArrowUpRight, Bookmark, ImageOff } from "lucide-react";
import { motion } from "motion/react";
import { FormattedMessage, useIntl } from "react-intl";

import { Button } from "@/components/Button";

import type { PhotoCardProps } from "./PhotoCardProps";

export const PhotoCard: FC<PhotoCardProps> = ({
  photo,
  index,
  isSaved,
  onOpen,
  onSave,
}) => {
  const [hasError, setHasError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const intl = useIntl();
  return (
    <motion.article
      className="photo-card group relative mb-5 break-inside-avoid"
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "100px" }}
      transition={{
        duration: 0.65,
        delay: Math.min(index % 4, 3) * 0.07,
        ease: [0.22, 1, 0.36, 1],
      }}
      layout={false}
    >
      <div
        className="relative isolate overflow-hidden rounded-xl bg-surface-strong"
        style={{
          aspectRatio: `${photo.width} / ${photo.height}`,
          backgroundColor: photo.color,
        }}
      >
        <Button
          className="photo-open absolute inset-0 h-full w-full cursor-zoom-in text-left focus-visible:outline-offset-[-5px]"
          onPress={() => onOpen(photo.id)}
          aria-label={intl.formatMessage(
            { id: "photo.open", defaultMessage: "View {title}" },
            { title: photo.title },
          )}
        >
          {!hasError && (
            <Image
              src={photo.src}
              alt={photo.alt}
              fill
              unoptimized
              sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, (max-width: 1535px) 33vw, 25vw"
              fetchPriority={index === 0 ? "high" : "auto"}
              loading={index < 4 || index % 4 === 0 ? "eager" : "lazy"}
              className={`object-cover transition-[transform,opacity,filter] duration-700 ease-out group-hover:scale-[1.055] ${isLoaded ? "opacity-100" : "opacity-0"}`}
              onLoad={() => setIsLoaded(true)}
              onError={() => setHasError(true)}
            />
          )}
          {!isLoaded && !hasError && (
            <span className="image-shimmer absolute inset-0" />
          )}
          {hasError && (
            <span className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-surface-strong p-6 text-center text-muted">
              <ImageOff size={26} strokeWidth={1.3} />
              <span className="text-xs">
                <FormattedMessage
                  id="photo.unavailable"
                  defaultMessage="A moment out of reach"
                />
              </span>
            </span>
          )}
          <span className="photo-scrim absolute inset-0 opacity-0 transition-opacity duration-500 group-focus-within:opacity-100 group-hover:opacity-100" />
          <span className="absolute right-4 bottom-4 flex size-9 translate-y-2 items-center justify-center rounded-full border border-on-image/50 text-on-image opacity-0 transition-all duration-300 group-focus-within:translate-y-0 group-focus-within:opacity-100 group-hover:translate-y-0 group-hover:opacity-100">
            <ArrowUpRight size={18} />
          </span>
          <span className="absolute bottom-5 left-5 max-w-[75%] translate-y-2 text-xs font-medium text-on-image opacity-0 transition-all duration-300 group-focus-within:translate-y-0 group-focus-within:opacity-100 group-hover:translate-y-0 group-hover:opacity-100">
            {photo.location}
          </span>
        </Button>
        <Button
          onPress={() => onSave(photo.id)}
          aria-label={intl.formatMessage(
            {
              id: isSaved ? "photo.unsave" : "photo.save",
              defaultMessage: isSaved ? "Unsave {title}" : "Save {title}",
            },
            { title: photo.title },
          )}
          aria-pressed={isSaved}
          className={`save-button absolute top-3 right-3 z-10 flex size-10 items-center justify-center rounded-full transition-all duration-300 active:scale-90 ${isSaved ? "bg-accent text-ink" : "bg-background/90 text-ink hover:bg-accent sm:opacity-0 sm:group-focus-within:opacity-100 sm:group-hover:opacity-100"}`}
        >
          <Bookmark
            size={17}
            strokeWidth={1.7}
            fill={isSaved ? "currentColor" : "none"}
          />
        </Button>
        <span className="pointer-events-none absolute top-4 left-4 rounded-full border border-on-image/25 bg-ink/15 px-2.5 py-1 text-[9px] font-medium tracking-wider text-on-image uppercase opacity-0 backdrop-blur-md transition-opacity duration-300 group-focus-within:opacity-100 group-hover:opacity-100">
          {photo.category}
        </span>
      </div>
      <div className="flex items-start justify-between gap-2 px-0.5 pt-3">
        <h3 className="text-[13px] leading-5 font-medium tracking-[-0.02em]">
          {photo.title}
        </h3>
        <span className="pt-0.5 text-[10px] leading-4 text-muted">
          {photo.category}
        </span>
      </div>
    </motion.article>
  );
};
