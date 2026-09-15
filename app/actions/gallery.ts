"use server";

import { DEMO_MODE, DRIVE_MODE } from "@/constants/gallery";
import { getPhotographer, isDemoMode } from "@/lib/galleryConfig";
import { getDrivePhotos } from "@/lib/googleDrive";
import { SAMPLE_PHOTOS } from "@/lib/samplePhotos";
import type { GalleryResult } from "@/types/gallery";

export async function getGallery(): Promise<GalleryResult> {
  try {
    const isDemo = isDemoMode();
    const photos = isDemo ? SAMPLE_PHOTOS : await getDrivePhotos();
    return {
      success: true,
      data: {
        photos,
        mode: isDemo ? DEMO_MODE : DRIVE_MODE,
        photographer: getPhotographer(),
      },
    };
  } catch {
    // Never serialize upstream responses, service-account keys, or configuration errors to clients.
    console.error(
      "[gallery] Unable to load catalogue. Check server-side Drive configuration, folder permissions, and connectivity.",
    );
    return {
      success: false,
      message:
        "The archive is taking a little longer. Please try again in a moment.",
    };
  }
}
