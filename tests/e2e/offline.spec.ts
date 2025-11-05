import { test, expect } from "@playwright/test";

const HOWTO_SLUG = "android-screenshot";
const HOWTO_TITLE = "Screenshot erstellen";

test.describe("offline experience", () => {
  test("serves cached pages when offline", async ({ page, context }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Wait until a service worker controls the page.
    await page.waitForFunction(() => navigator.serviceWorker?.controller !== null);

    await page.goto(`/howto/${HOWTO_SLUG}`);
    await expect(page.getByRole("heading", { level: 2, name: HOWTO_TITLE })).toBeVisible();

    await context.setOffline(true);

    await page.goto("/", { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("heading", { level: 1, name: "Willkommen" })).toBeVisible();
    await expect(page.getByTestId("offline-banner")).toBeVisible();

    await page.goto(`/howto/${HOWTO_SLUG}`, { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("heading", { level: 2, name: HOWTO_TITLE })).toBeVisible();

    await context.setOffline(false);
  });
});
