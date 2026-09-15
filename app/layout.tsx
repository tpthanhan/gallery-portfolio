import type { FC } from "react";
import type { Metadata } from "next";
import { DM_Serif_Display, Geist } from "next/font/google";

import { AppWrapper } from "@/components/AppWrapper";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});
const editorial = DM_Serif_Display({
  variable: "--font-editorial",
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Still — Life, through a different lens",
  description:
    "Places, people, and the poetry in between. Explore Still, a thoughtfully curated visual journal of a world that never sits still.",
  applicationName: "Still",
  openGraph: {
    title: "Still — A visual journal",
    description: "A collection of things worth slowing down for.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Still — A visual journal",
    description: "Life, through a different lens.",
  },
};

const RootLayout: FC<LayoutProps<"/">> = ({ children }) => (
  <html
    lang="en"
    className={`${geistSans.variable} ${editorial.variable} antialiased`}
  >
    <body>
      <AppWrapper>{children}</AppWrapper>
    </body>
  </html>
);

export default RootLayout;
