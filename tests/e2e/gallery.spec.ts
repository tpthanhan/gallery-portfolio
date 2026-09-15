import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  page.on("pageerror", (error) =>
    console.error("Browser runtime error:", error.message),
  );
});

test("gallery filters, search, layouts, pagination, and keyboard viewer work", async ({
  page,
}, testInfo) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error" && /hydrat/i.test(message.text()))
      errors.push(message.text());
  });
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "different lens.",
  );
  await expect(page.locator(".photo-card")).toHaveCount(16);
  expect(errors).toEqual([]);
  await expect(
    page.getByRole("button", { name: "A little more inspiration" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "A little more inspiration" }).click();
  await expect(page.locator(".photo-card")).toHaveCount(24);

  await page.getByRole("button", { name: "Architecture", exact: true }).click();
  await expect(page.locator(".photo-card")).toHaveCount(4);
  await page.getByRole("button", { name: "All work" }).click();
  const search = page
    .getByRole("searchbox", { name: "Search photos" })
    .filter({ visible: true });
  await search.fill("alpine italy");
  await expect(page.locator(".photo-card")).toHaveCount(1);
  await search.fill("no-such-photo-123");
  await expect(
    page.getByText("A little too far off the beaten path."),
  ).toBeVisible();
  await page.getByRole("button", { name: "Explore all moments" }).click();
  await expect(page.locator(".photo-card")).toHaveCount(16);

  await page.getByRole("button", { name: "Compact grid" }).click();
  await expect(
    page.getByRole("button", { name: "Compact grid" }),
  ).toHaveAttribute("aria-pressed", "true");
  await page.getByRole("button", { name: "Comfortable grid" }).click();
  await page.getByRole("button", { name: "View Alpine stillness" }).click();
  const viewer = page.getByRole("dialog", { name: "Photo viewer" });
  await expect(viewer).toBeVisible();
  await expect(viewer.getByRole("heading")).toHaveText("Alpine stillness");
  await page.keyboard.press("ArrowRight");
  await expect(viewer.getByRole("heading")).toHaveText("Soft geometry");
  await page.keyboard.press("ArrowLeft");
  await expect(viewer.getByRole("heading")).toHaveText("Alpine stillness");
  await page.keyboard.press("Escape");
  await expect(viewer).not.toBeVisible();
  await expect(
    page.getByRole("button", { name: "View Alpine stillness" }),
  ).toBeFocused();
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({
    path: testInfo.outputPath("gallery.png"),
    fullPage: false,
  });
  const hasOverflow = await page.evaluate(
    () => document.documentElement.scrollWidth > window.innerWidth,
  );
  expect(hasOverflow).toBe(false);
  const scrollbarWidth = await page.evaluate(
    () => getComputedStyle(document.documentElement).scrollbarWidth,
  );
  expect(scrollbarWidth).toBe("none");
  await page.mouse.wheel(0, 600);
  await expect
    .poll(() => page.evaluate(() => window.scrollY))
    .toBeGreaterThan(0);
  expect(errors).toEqual([]);
});

test("favorites persist, collections filter, and shared links open the viewer", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: "View Alpine stillness" }).hover();
  await page
    .getByRole("button", { name: "Save Alpine stillness", exact: true })
    .click();
  await page.getByRole("button", { name: /^Saved/ }).click();
  await expect(page.locator(".photo-card")).toHaveCount(1);
  await page.reload();
  await page.getByRole("button", { name: /^Saved/ }).click();
  await expect(page.locator(".photo-card")).toHaveCount(1);
  await page.getByRole("button", { name: "View Alpine stillness" }).hover();
  await page.getByRole("button", { name: "Unsave Alpine stillness" }).click();
  await expect(page.getByText("Keep a little inspiration.")).toBeVisible();
  await page.getByRole("button", { name: /Collections/ }).click();
  const collections = page.getByRole("dialog", { name: "Curated collections" });
  await expect(collections).toBeVisible();
  await collections.getByRole("button", { name: /Architecture/ }).click();
  await expect(collections).not.toBeVisible();
  await expect(page.locator(".photo-card")).toHaveCount(4);
  await page.getByRole("button", { name: "About", exact: true }).click();
  await expect(page.getByRole("dialog", { name: "About Still" })).toBeVisible();
  await page.getByRole("button", { name: "Close about" }).click();
  await page.goto("/?photo=alpine-stillness");
  await expect(
    page.getByRole("dialog", { name: "Photo viewer" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Close photo viewer" }).click();
  await expect(page).not.toHaveURL(/photo=/);
});

test("demo never requests Google Drive and invalid proxy requests fail closed", async ({
  page,
  request,
}) => {
  const driveRequests: string[] = [];
  page.on("request", (req) => {
    if (/googleapis\.com|drive\.google\.com/.test(req.url()))
      driveRequests.push(req.url());
  });
  await page.goto("/");
  await expect(page.locator(".photo-card")).toHaveCount(16);
  expect(driveRequests).toEqual([]);
  const result = await request.get("/api/images/arbitrary-id?token=invalid");
  expect(result.status()).toBe(404);
  const html = await page.content();
  expect(html).not.toContain("BEGIN PRIVATE KEY");
  expect(html).not.toContain("GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY");
});
