import { createHmac, timingSafeEqual } from "node:crypto";

const TOKEN_LIFETIME_SECONDS = 24 * 60 * 60;
const FILE_ID_PATTERN = /^[a-zA-Z0-9_-]{1,200}$/;

const digest = (
  id: string,
  folderId: string,
  expires: number,
  secret: string,
) =>
  createHmac("sha256", secret)
    .update(`gallery-image:${folderId}:${id}:${expires}`)
    .digest("base64url");

export const createImageToken = (
  id: string,
  folderId: string,
  secret: string,
  now = Date.now(),
) => {
  const expires = Math.floor(now / 1000) + TOKEN_LIFETIME_SECONDS;
  return `${expires}.${digest(id, folderId, expires, secret)}`;
};

export const verifyImageToken = (
  id: string,
  token: string,
  folderId: string,
  secret: string,
  now = Date.now(),
) => {
  if (!FILE_ID_PATTERN.test(id)) return false;
  const parts = token.split(".");
  if (parts.length !== 2 || !/^\d{10,12}$/.test(parts[0])) return false;
  const expires = Number(parts[0]);
  const currentTime = Math.floor(now / 1000);
  if (expires <= currentTime || expires > currentTime + TOKEN_LIFETIME_SECONDS)
    return false;
  const actual = Buffer.from(parts[1]);
  const expected = Buffer.from(digest(id, folderId, expires, secret));
  return actual.length === expected.length && timingSafeEqual(actual, expected);
};
