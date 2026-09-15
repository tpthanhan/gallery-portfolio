import "server-only";

import { unstable_cache } from "next/cache";
import { createSign } from "node:crypto";
import { z } from "zod";

import { CATEGORIES } from "@/constants/gallery";
import type { Photo } from "@/types/gallery";

import { getDriveConfig } from "./galleryConfig";
import { createImageToken } from "./imageTokens";

const TOKEN_URL = "https://oauth2.googleapis.com/token";
const DRIVE_API = "https://www.googleapis.com/drive/v3/files";
const DRIVE_SCOPE = "https://www.googleapis.com/auth/drive.readonly";
const REQUEST_TIMEOUT_MS = 15_000;
const MAX_IMAGE_BYTES = 25 * 1024 * 1024;
export const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
];

const tokenSchema = z.object({
  access_token: z.string(),
  expires_in: z.number().positive(),
});
const fileSchema = z.object({
  id: z.string().regex(/^[a-zA-Z0-9_-]+$/),
  name: z.string(),
  mimeType: z.string(),
  size: z.string().optional(),
  description: z.string().optional(),
  parents: z.array(z.string()).optional(),
  trashed: z.boolean().optional(),
  appProperties: z.record(z.string(), z.string()).optional(),
  imageMediaMetadata: z
    .object({
      width: z.number().positive().optional(),
      height: z.number().positive().optional(),
    })
    .optional(),
});
const listSchema = z.object({
  files: z.array(fileSchema).default([]),
  nextPageToken: z.string().optional(),
});
let tokenCache:
  { value: string; expiresAt: number; identity: string } | undefined;
let tokenRequest: { identity: string; promise: Promise<string> } | undefined;

export const getDriveAccessToken = async (): Promise<string> => {
  const config = getDriveConfig();
  const identity = `${config.clientEmail}:${config.privateKey}`;
  if (tokenCache?.identity === identity && tokenCache.expiresAt > Date.now())
    return tokenCache.value;
  if (tokenRequest?.identity === identity) return tokenRequest.promise;

  const request = async () => {
    const now = Math.floor(Date.now() / 1000);
    const encode = (value: object) =>
      Buffer.from(JSON.stringify(value)).toString("base64url");
    const unsigned = `${encode({ alg: "RS256", typ: "JWT" })}.${encode({ iss: config.clientEmail, scope: DRIVE_SCOPE, aud: TOKEN_URL, iat: now, exp: now + 3600 })}`;
    const signer = createSign("RSA-SHA256");
    signer.update(unsigned);
    const assertion = `${unsigned}.${signer.sign(config.privateKey, "base64url")}`;
    const response = await fetch(TOKEN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
        assertion,
      }),
      cache: "no-store",
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
    if (!response.ok) throw new Error("Drive authentication failed");
    const token = tokenSchema.parse(await response.json());
    tokenCache = {
      value: token.access_token,
      expiresAt: Date.now() + Math.max(0, token.expires_in - 60) * 1000,
      identity,
    };
    return token.access_token;
  };
  const promise = request();
  tokenRequest = { identity, promise };
  try {
    return await promise;
  } finally {
    if (tokenRequest?.promise === promise) tokenRequest = undefined;
  }
};

const fetchDriveFiles = unstable_cache(
  async (folderId: string) => {
    const token = await getDriveAccessToken();
    const files: z.infer<typeof fileSchema>[] = [];
    let pageToken: string | undefined;
    // A bounded catalogue prevents an accidentally huge Drive folder exhausting the server.
    const maxPages = 5;
    for (let page = 0; page < maxPages; page++) {
      const query = new URLSearchParams({
        q: `'${folderId}' in parents and trashed = false and (${ALLOWED_IMAGE_TYPES.map((type) => `mimeType = '${type}'`).join(" or ")})`,
        fields:
          "nextPageToken,files(id,name,mimeType,size,description,appProperties,imageMediaMetadata(width,height))",
        pageSize: "100",
        orderBy: "createdTime desc",
        supportsAllDrives: "true",
        includeItemsFromAllDrives: "true",
      });
      if (pageToken != null) query.set("pageToken", pageToken);
      const response = await fetch(`${DRIVE_API}?${query}`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      });
      if (!response.ok) throw new Error("Drive catalogue is unavailable");
      const result = listSchema.parse(await response.json());
      files.push(...result.files);
      pageToken = result.nextPageToken;
      if (pageToken == null) break;
    }
    return files.filter(
      (file) =>
        ALLOWED_IMAGE_TYPES.includes(file.mimeType) &&
        file.size != null &&
        Number(file.size) > 0 &&
        Number(file.size) <= MAX_IMAGE_BYTES,
    );
  },
  ["drive-catalogue-v1"],
  { revalidate: 300 },
);

export const getDrivePhotos = async (): Promise<Photo[]> => {
  const config = getDriveConfig();
  const files = await fetchDriveFiles(config.folderId);
  return files.map((file) => {
    const categoryMatch = file.name.match(
      /^\[(Nature|Architecture|Street|Travel|Portraits)\]\s*/i,
    );
    const rawCategory = file.appProperties?.category ?? categoryMatch?.[1];
    const category = CATEGORIES.find(
      (candidate) =>
        candidate !== "All work" &&
        candidate.toLowerCase() === rawCategory?.toLowerCase(),
    );
    const title = file.name
      .replace(/^\[[^\]]+\]\s*/, "")
      .replace(/\.[^.]+$/, "")
      .replace(/[_-]/g, " ");
    const token = createImageToken(
      file.id,
      config.folderId,
      config.signingSecret,
    );
    return {
      id: file.id,
      title,
      alt: file.appProperties?.alt ?? file.description ?? title,
      category:
        category != null && category !== "All work" ? category : "Nature",
      location: file.appProperties?.location ?? "From the archive",
      src: `/api/images/${encodeURIComponent(file.id)}?token=${encodeURIComponent(token)}`,
      width: file.imageMediaMetadata?.width ?? 1200,
      height: file.imageMediaMetadata?.height ?? 1500,
      color: "#d9d7cf",
    };
  });
};

export const fetchDriveImage = async (id: string, folderId: string) => {
  const token = await getDriveAccessToken();
  const headers = { Authorization: `Bearer ${token}` };
  // Recheck membership so moving/deleting a previously signed file revokes access immediately.
  const metadataResponse = await fetch(
    `${DRIVE_API}/${encodeURIComponent(id)}?fields=id,name,mimeType,size,parents,trashed&supportsAllDrives=true`,
    {
      headers,
      cache: "no-store",
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    },
  );
  if (!metadataResponse.ok) return null;
  const file = fileSchema.parse(await metadataResponse.json());
  if (
    file.trashed ||
    !file.parents?.includes(folderId) ||
    !ALLOWED_IMAGE_TYPES.includes(file.mimeType) ||
    file.size == null ||
    !(Number(file.size) > 0 && Number(file.size) <= MAX_IMAGE_BYTES)
  )
    return null;
  const response = await fetch(
    `${DRIVE_API}/${encodeURIComponent(id)}?alt=media&supportsAllDrives=true`,
    {
      headers,
      cache: "no-store",
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    },
  );
  const responseType = response.headers
    .get("content-type")
    ?.split(";")[0]
    .trim()
    .toLowerCase();
  const responseLength = Number(response.headers.get("content-length"));
  if (
    !response.ok ||
    response.body == null ||
    responseType !== file.mimeType ||
    responseLength > MAX_IMAGE_BYTES
  ) {
    await response.body?.cancel();
    return null;
  }
  return { response, mimeType: file.mimeType };
};
