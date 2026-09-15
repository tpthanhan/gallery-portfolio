"use client";

import type { FC } from "react";
import Image from "next/image";
import { ArrowDown, ArrowDownRight, Asterisk } from "lucide-react";
import { motion } from "motion/react";
import { FormattedMessage } from "react-intl";

import type { HeroProps } from "./HeroProps";

export const Hero: FC<HeroProps> = ({ photos, photographer }) => {
  return (
    <section
      className="relative pt-10 pb-9 sm:pt-14 sm:pb-12 lg:pt-16"
      aria-labelledby="hero-heading"
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="mb-7 flex items-center gap-2.5"
      >
        <span className="relative flex size-2">
          <span className="status-pulse absolute inline-flex h-full w-full rounded-full bg-green opacity-35" />
          <span className="relative inline-flex size-2 rounded-full bg-green" />
        </span>
        <p className="eyebrow">
          <FormattedMessage
            id="hero.eyebrow"
            defaultMessage="An ongoing collection of curiosity"
          />
        </p>
      </motion.div>
      <div className="flex flex-col justify-between gap-9 lg:flex-row lg:items-end">
        <h1
          id="hero-heading"
          className="hero-heading text-[clamp(3.5rem,7.3vw,7.4rem)] leading-[0.98] tracking-[-0.065em]"
        >
          <span className="block overflow-hidden pb-2">
            <motion.span
              className="block"
              initial={{ y: "105%" }}
              animate={{ y: 0 }}
              transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            >
              <FormattedMessage
                id="hero.line1"
                defaultMessage="Life, through a"
              />
            </motion.span>
          </span>
          <span className="relative block overflow-hidden pb-3">
            <motion.span
              className="block font-display font-normal tracking-[-0.045em] italic"
              initial={{ y: "105%" }}
              animate={{ y: 0 }}
              transition={{
                duration: 1,
                delay: 0.12,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              <FormattedMessage
                id="hero.line2"
                defaultMessage="different lens."
              />
              <span className="ml-3 inline-flex size-9 translate-y-[-8%] items-center justify-center rounded-full bg-accent align-middle sm:ml-5 sm:size-14 lg:size-16">
                <Asterisk
                  className="slow-spin size-7 text-ink sm:size-11"
                  strokeWidth={1.25}
                />
              </span>
            </motion.span>
          </span>
        </h1>
        <motion.div
          className="flex max-w-sm items-end justify-between gap-7 pb-4 lg:max-w-66 lg:flex-col lg:items-start"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.35 }}
        >
          <div>
            <p className="text-[13px] leading-[1.9] text-muted">
              <FormattedMessage
                id="hero.description"
                defaultMessage="Places, people, and the poetry in between. A visual journal of a world that never sits still."
              />
            </p>
            <div className="mt-5 flex items-center gap-3">
              <div className="flex pl-0.5">
                {photos.slice(0, 3).map((photo, index) => (
                  <div
                    key={photo.id}
                    className={`relative -ml-0.5 size-8 overflow-hidden rounded-full border-2 border-background ${index === 1 ? "-rotate-12" : "rotate-6"}`}
                  >
                    <Image
                      src={photo.src}
                      alt=""
                      fill
                      unoptimized
                      sizes="32px"
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
              <p className="text-[10px] text-muted">
                <FormattedMessage
                  id="hero.by"
                  defaultMessage="Through the eyes of"
                />
                <br />
                <span className="mt-0.5 inline-block font-medium text-ink">
                  {photographer}
                  <ArrowDownRight size={11} className="ml-1 inline" />
                </span>
              </p>
            </div>
          </div>
          <a
            href="#gallery"
            className="group flex size-11 shrink-0 items-center justify-center rounded-full border border-line transition-all duration-300 hover:border-ink hover:bg-accent lg:hidden"
            aria-label="Explore the gallery"
          >
            <ArrowDown
              size={17}
              className="transition-transform group-hover:translate-y-1"
            />
          </a>
        </motion.div>
      </div>
      <div className="mt-8 flex items-center justify-between gap-3 border-t border-line pt-5 sm:mt-9">
        <p className="flex items-center gap-2 text-[9px] font-medium tracking-[0.14em] uppercase">
          <Asterisk size={13} />
          <FormattedMessage
            id="hero.note"
            defaultMessage="Not just photographs. Little reasons to pause."
          />
        </p>
        <a
          href="#gallery"
          className="group hidden items-center gap-3 text-[9px] tracking-[0.14em] text-muted uppercase sm:flex"
        >
          <FormattedMessage
            id="hero.scroll"
            defaultMessage="Take a look around"
          />
          <ArrowDown
            size={12}
            className="transition-transform group-hover:translate-y-1"
          />
        </a>
      </div>
    </section>
  );
};
