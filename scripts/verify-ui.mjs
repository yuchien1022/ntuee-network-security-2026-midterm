import { mkdtemp, writeFile, rm } from "fs/promises";
import path from "path";
import os from "os";
import { chromium } from "playwright";

const BASE_URL = process.env.BASE_URL ?? "http://127.0.0.1:8000";
const API_BASE = `${BASE_URL}/api/v1`;
const results = [];

const PNG_BASE64 =
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Y9WewAAAABJRU5ErkJggg==";

function logResult(name, passed, details) {
  results.push({ name, status: passed ? "PASS" : "FAIL", details });
}

async function createTempPng() {
  const dir = await mkdtemp(path.join(os.tmpdir(), "ui-verify-"));
  const filePath = path.join(dir, "avatar.png");
  await writeFile(filePath, Buffer.from(PNG_BASE64, "base64"));
  return {
    filePath,
    cleanup: async () => {
      await rm(dir, { recursive: true, force: true });
    },
  };
}

async function ensurePageOk(page, route = "/#/") {
  await page.goto(`${BASE_URL}${route}`);
  await page.waitForLoadState("networkidle");
}

async function run() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  const tmp = await createTempPng();

  try {
    await ensurePageOk(page, "/#/");
    const owner = page.locator("img.owner-photo");
    await owner.waitFor({ state: "visible" });
    const ownerCheck = await owner.evaluate((img) => ({
      currentSrc: img.currentSrc,
      naturalWidth: img.naturalWidth,
    }));
    logResult(
      "homepage owner photo",
      ownerCheck.naturalWidth > 0 && ownerCheck.currentSrc.endsWith("/owner.jpg"),
      ownerCheck
    );

    await page.route(`${API_BASE}/upload/avatar`, async (route) => {
      await route.fulfill({
        status: 500,
        contentType: "application/json",
        body: JSON.stringify({ error: "Avatar upload failed in test." }),
      });
    });

    const stamp = Date.now();
    await ensurePageOk(page, "/#/register");
    await page.fill("#username", `ui_reg_${stamp}`);
    await page.fill("#email", `ui_reg_${stamp}@example.com`);
    await page.fill("#password", "Password123!");
    await page.setInputFiles("#avatar", tmp.filePath);
    await page.getByRole("button", { name: "Register" }).click();
    await page.waitForURL("**/#/profile");
    const registerError = page.locator(".form-message.error");
    await registerError.waitFor({ state: "visible" });
    const registerErrorText = await registerError.first().textContent();
    logResult(
      "registration avatar upload failure message",
      registerErrorText?.includes("Avatar upload failed in test.") ?? false,
      { route: page.url(), message: registerErrorText }
    );
    await page.unroute(`${API_BASE}/upload/avatar`);

    await page.route(`${API_BASE}/messages`, async (route, request) => {
      if (request.method() === "GET") {
        await route.fulfill({
          status: 500,
          contentType: "application/json",
          body: JSON.stringify({ error: "Messages API unavailable." }),
        });
        return;
      }
      await route.fallback();
    });

    await ensurePageOk(page, "/#/messages");
    const messageError = page.locator(".form-message.error");
    await messageError.waitFor({ state: "visible" });
    const messageErrorText = await messageError.first().textContent();
    logResult(
      "message board load error",
      messageErrorText?.includes("Messages API unavailable.") ?? false,
      { message: messageErrorText }
    );
    await page.unroute(`${API_BASE}/messages`);

    await page.route(`${API_BASE}/users`, async (route) => {
      await route.fulfill({
        status: 500,
        contentType: "application/json",
        body: JSON.stringify({ error: "Visitors API unavailable." }),
      });
    });

    await ensurePageOk(page, "/#/users");
    const usersError = page.locator(".form-message.error");
    await usersError.waitFor({ state: "visible" });
    const usersErrorText = await usersError.first().textContent();
    logResult(
      "users list load error",
      usersErrorText?.includes("Visitors API unavailable.") ?? false,
      { message: usersErrorText }
    );
    await page.unroute(`${API_BASE}/users`);

    await page.route(`${API_BASE}/upload/avatar`, async (route) => {
      await route.fulfill({
        status: 400,
        contentType: "application/json",
        body: JSON.stringify({ error: "Profile upload rejected in test." }),
      });
    });

    await ensurePageOk(page, "/#/profile");
    await page.setInputFiles("#profile-avatar", tmp.filePath);
    const profileError = page.locator(".form-message.error");
    await profileError.waitFor({ state: "visible" });
    const profileErrorText = await profileError.first().textContent();
    logResult(
      "profile upload error",
      profileErrorText?.includes("Profile upload rejected in test.") ?? false,
      { message: profileErrorText }
    );
    await page.unroute(`${API_BASE}/upload/avatar`);
  } finally {
    await tmp.cleanup();
    await context.close();
    await browser.close();
  }

  const failed = results.filter((result) => result.status === "FAIL");
  console.log(JSON.stringify({ baseUrl: BASE_URL, results }, null, 2));
  if (failed.length > 0) {
    process.exit(1);
  }
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
