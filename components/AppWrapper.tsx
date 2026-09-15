"use client";

import { useState, type FC } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MotionConfig } from "motion/react";
import { IntlProvider } from "react-intl";

import { GALLERY_STALE_TIME } from "@/constants/gallery";

import type { AppWrapperProps } from "./AppWrapperProps";

export const AppWrapper: FC<AppWrapperProps> = ({ children }) => {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: GALLERY_STALE_TIME,
            retry: 1,
            refetchOnWindowFocus: false,
          },
        },
      }),
  );
  return (
    <IntlProvider locale="en" defaultLocale="en">
      <QueryClientProvider client={queryClient}>
        <MotionConfig reducedMotion="user">{children}</MotionConfig>
      </QueryClientProvider>
    </IntlProvider>
  );
};
