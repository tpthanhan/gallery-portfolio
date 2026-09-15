import "server-only";

import { z } from "zod";

const driveConfigSchema = z.object({
  folderId: z.string().regex(/^[a-zA-Z0-9_-]+$/),
  clientEmail: z.email(),
  privateKey: z
    .string()
    .min(1)
    .transform((key) => key.replace(/\\n/g, "\n")),
  signingSecret: z.string().min(32),
});

export const isDemoMode = () => process.env.GALLERY_DEMO_MODE !== "false";
export const getPhotographer = () =>
  process.env.GALLERY_PHOTOGRAPHER?.trim() || "Alex Morgan";

export const getDriveConfig = () =>
  driveConfigSchema.parse({
    folderId: process.env.GOOGLE_DRIVE_FOLDER_ID,
    clientEmail: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    privateKey: process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY,
    signingSecret: process.env.GALLERY_SIGNING_SECRET,
  });
