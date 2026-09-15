# Still — a visual journal

An editorial, Pinterest-inspired photography portfolio built with **Next.js App Router, React 19, TypeScript, HeroUI v3, Tailwind CSS 4, Motion, Zustand, and TanStack Query**.

Warm ivory. Expressive typography. A photo-first masonry wall. And a little room to pause.

## Run locally

```sh
yarn install
# Copy .env.example to .env.local (a demo .env.local is already supplied locally).
yarn dev
```

Open **http://localhost:3000**. Demo mode is enabled by default, even without an env file. It uses 24 curated remote Unsplash images and makes **zero Google Drive API calls**. Demo images still need an internet connection; they are not bundled offline. Captions, locations, and the photographer identity are illustrative, not attribution claims.

## What's included

- HeroUI buttons, search inputs, and accessible modal dialogs, customized to the editorial theme.
- Hidden native scrollbars throughout; mouse-wheel, touch, and keyboard scrolling are preserved.
- Responsive masonry, two grid densities, and incremental “load more” browsing.
- Five collections, multi-term search across titles/descriptions/locations, and category filters.
- Browser-persisted favorites with useful empty states.
- Immersive lightbox with next/previous navigation, Escape to close, focus trapping/restoration, and shareable photo links.
- Animated headline reveals, staggered photo entrances, spring-driven filter pills, image zooms, hover overlays, shimmer loading, subtle grain, rotating accent, and animated dialogs.
- OS reduced-motion preference support, keyboard controls, semantic buttons, focus states, alt text, and mobile touch controls.
- Real loading/error/retry states and graceful unavailable-image placeholders.
- Server action-backed data, private Google Drive integration, and a signed same-origin image proxy.

**Shortcuts:** `/` focuses desktop search; `←` / `→` navigate the lightbox; `Esc` closes a dialog. Favorites stay in the current browser; there is no account or cross-device sync.

## Connect your Google Drive

### 1. Create a read-only identity

1. Create or select a project in [Google Cloud Console](https://console.cloud.google.com/).
2. Enable **Google Drive API**.
3. Under **IAM & Admin → Service Accounts**, create a service account. No project-wide role or domain-wide delegation is necessary for this gallery.
4. Open that service account → **Keys → Add key → Create new key → JSON**. Keep this file private; never commit it.
5. Create a dedicated portfolio folder in Google Drive. Share **only that folder** with the JSON key's `client_email` as **Viewer**. The folder does not need public/link sharing.
6. Copy the folder ID from `https://drive.google.com/drive/folders/FOLDER_ID`.

### 2. Set server-only environment variables

Copy `.env.example` to `.env.local` and set:

```dotenv
GALLERY_DEMO_MODE=false
GALLERY_PHOTOGRAPHER="Your Name"
GOOGLE_DRIVE_FOLDER_ID="your-folder-id"
GOOGLE_SERVICE_ACCOUNT_EMAIL="gallery@your-project.iam.gserviceaccount.com"
GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_KEY_CONTENT\n-----END PRIVATE KEY-----\n"
GALLERY_SIGNING_SECRET="replace-with-a-strong-random-secret-at-least-32-characters"
```

Copy the complete `private_key` value from the downloaded JSON, preserving escaped `\n` newlines. Actual multiline secret values from hosting dashboards also work.

Generate a signing secret:

```sh
node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"
```

Restart the server after changing environment variables. On Vercel or another host, configure the same variables in its secret/environment settings and redeploy. **Never add a `NEXT_PUBLIC_` prefix to any credential.**

### 3. Add photos

Upload JPEG, PNG, WebP, GIF, or AVIF files directly into the shared folder. SVG, HEIC, non-images, files without a valid size, and images larger than **25 MiB** are excluded. Export oversized camera originals as web-ready JPEG/WebP first; around **1600–2400 pixels wide** is a good starting point.

Optional filename categories:

```text
[Nature] Alpine stillness.jpg
[Architecture] Soft geometry.webp
[Street] After the rain.jpg
[Travel] Desert daydream.jpg
[Portraits] Quiet presence.jpg
```

The prefix becomes the collection; the extension is removed and underscores/hyphens become spaces. Unrecognized or absent categories default to Nature. A Drive description supplies alt text. If you manage Drive metadata programmatically with the same application, `appProperties.category`, `appProperties.location`, and `appProperties.alt` override defaults.

The catalogue lists the newest **up to 500 files**, in 100-file pages, without descending into subfolders. Catalogue metadata is cached for **5 minutes**; refreshing within that period may still show recently removed entries, but the media proxy always checks current folder membership before serving a new request. Existing downloaded images cannot be revoked from visitors' devices.

## Security model — important

**This is a public portfolio backed by a private Drive folder, not a private photo vault.** Visitors are intentionally allowed to view the selected folder's photos. A server action protects credentials; it is **not authentication**. If the photos themselves must be private, add application authentication/authorization to **both** the action and the image route before deploying.

1. `app/actions/gallery.ts` is a `"use server"` action. It accepts no folder ID, URL, query, or file ID from clients. It returns only a sanitized catalogue.
2. `lib/googleDrive.ts` and `lib/galleryConfig.ts` are guarded with `server-only`. A service-account JWT is exchanged for a short-lived, **read-only** Google access token. The token and private key never enter browser data.
3. Only images listed from the configured folder receive HMAC-SHA256 capabilities. Each capability is scoped to **file + folder + expiry** and expires after **24 hours**.
4. `app/api/images/[id]/route.ts` rejects unsigned, expired, malformed, or tampered requests before contacting Google. It never fetches arbitrary caller-supplied URLs.
5. The proxy rechecks current parent-folder membership, trash status, MIME type, and size. It excludes active SVG content and verifies the upstream media content type before streaming.
6. Image responses are same-origin, non-sniffable, sandboxed, and `private, no-store`. Upstream errors and credentials are not serialized to the client.
7. `.env.local` is Git-ignored; `.env.example` contains only placeholders. Rotating the signing secret invalidates previously issued image URLs.

Visitors can copy/download images they can see and can share image capabilities until expiry. For a high-traffic public deployment, add platform-level rate limiting/WAF rules for pages, server actions, and `/api/images/*`; the proxy consumes Google API quota and bandwidth. Drive originals are streamed without server-side resizing to avoid creating another publicly addressable image-optimizer endpoint. Catalogue requests are cached, but media is deliberately not cached for immediate membership checks. Real Drive authentication and quota behavior need validation with your own account.

## Customize

| What                              | Where                    |
| --------------------------------- | ------------------------ |
| Photographer name                 | `GALLERY_PHOTOGRAPHER`   |
| Demo images, order, titles        | `lib/samplePhotos.ts`    |
| Colors, motion, component styling | `app/globals.css`        |
| Intro                             | `components/Hero.tsx`    |
| About copy                        | `components/About.tsx`   |
| Page title and social metadata    | `app/layout.tsx`         |
| Collection descriptions           | `constants/gallery.ts`   |
| Categories/search                 | `lib/filterPhotos.ts`    |
| Gallery loading                   | `app/actions/gallery.ts` |

Typography uses self-hosted-at-build-time `next/font` (Geist + DM Serif Display); the first production build needs access to Google's font servers. The application uses `react-intl` with English defaults, ready for a translated message catalogue.

## Validation

```sh
yarn typecheck
yarn lint
yarn test
yarn test:e2e
yarn build
```

Unit tests cover search intersections, sample integrity, capability tampering/expiry/scope, demo isolation, sanitized action failures, proxy authorization, and Drive metadata/media checks. Playwright covers desktop and mobile filtering, pagination, search, favorites persistence, collections, keyboard navigation, focus restoration, shared links, and horizontal overflow. It starts a demo dev server on port **3000** automatically, or reuses an existing local server. When reusing a server, ensure it is running in demo mode.

Browser tests use an installed Google Chrome by default. For bundled Chromium, run `yarn playwright install chromium` and set `PLAYWRIGHT_BROWSER_CHANNEL=chromium` when running tests. Screenshots and traces go to the ignored `test-results/` directory. Google Drive requests are mocked in unit tests; live credentials are neither needed nor checked into tests.

## Deploy

```sh
yarn build
yarn start
```

Deploy to a **Node.js-compatible Next.js host** (for example Vercel). Static export is not supported because the gallery relies on server actions and a Node crypto/streaming image route. Set production environment variables before deployment. Demo mode is a complete, deployable starting point.
