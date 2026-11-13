import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { chromium } from "playwright";

const baseUrl = process.env.BASE_URL || "http://127.0.0.1:4321";
const outDir = path.resolve("docs/qa");
const screenshotDir = path.join(outDir, "screenshots");
const pages = [
  { name: "home", path: "/" },
  { name: "services", path: "/services" },
  { name: "projects", path: "/projects" },
  { name: "blog", path: "/blog" },
  { name: "about", path: "/about" },
  { name: "contact", path: "/contact" },
];
const viewports = [
  { name: "390x844", width: 390, height: 844 },
  { name: "768x1024", width: 768, height: 1024 },
  { name: "1440x900", width: 1440, height: 900 },
];

await mkdir(screenshotDir, { recursive: true });
const browser = await chromium.launch({ headless: true });
const results = [];
const issues = [];
const browserVersion = browser.version();
let mobileNavigation = { status: "not-run" };

try {
  for (const viewport of viewports) {
    const context = await browser.newContext({ viewport, deviceScaleFactor: 1 });
    for (const route of pages) {
      const page = await context.newPage();
      const consoleErrors = [];
      const pageErrors = [];
      const failedRequests = [];
      const badResponses = [];
      const scriptRequests = [];
      const scriptResponses = [];

      page.on("console", (message) => {
        if (message.type() === "error") consoleErrors.push(message.text());
      });
      page.on("pageerror", (error) => pageErrors.push(error.message));
      page.on("requestfailed", (request) => {
        failedRequests.push({ url: request.url(), error: request.failure()?.errorText || "unknown" });
      });
      page.on("request", (request) => {
        if (request.resourceType() === "script") scriptRequests.push(request.url());
      });
      page.on("response", (response) => {
        if (response.status() >= 400) badResponses.push({ status: response.status(), url: response.url() });
        if (response.request().resourceType() === "script") {
          const length = Number(response.headers()["content-length"] || 0);
          scriptResponses.push({ url: response.url(), status: response.status(), bytes: length || null });
        }
      });

      let response = null;
      try {
        response = await page.goto(new URL(route.path, baseUrl).href, { waitUntil: "networkidle" });
        await page.evaluate(() => document.fonts.ready);
      } catch (error) {
        pageErrors.push(error instanceof Error ? error.message : String(error));
      }
      const metrics = await page.evaluate(() => {
        const nav = document.querySelector("#primary-navigation");
        const images = [...document.images].map((image) => ({
          src: image.currentSrc || image.src,
          alt: image.getAttribute("alt"),
          loaded: image.complete && image.naturalWidth > 0,
        }));
        return {
          title: document.title,
          lang: document.documentElement.lang,
          h1Count: document.querySelectorAll("h1").length,
          scrollWidth: document.documentElement.scrollWidth,
          clientWidth: document.documentElement.clientWidth,
          horizontalOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
          navDisplay: nav ? getComputedStyle(nav).display : "missing",
          menuButtonVisible: Boolean(document.querySelector(".menu-toggle") && getComputedStyle(document.querySelector(".menu-toggle")).display !== "none"),
          ctaCount: document.querySelectorAll("a.button, a.button--primary, a.button--nav").length,
          emptyStateCount: document.querySelectorAll(".empty-state[role='status']").length,
          images,
          scriptTags: [...document.scripts].map((script) => script.src).filter(Boolean),
          missingAltCount: images.filter((image) => image.alt === null).length,
        };
      });

      const screenshot = `${route.name}-${viewport.name}.png`;
      await page.screenshot({ path: path.join(screenshotDir, screenshot), fullPage: true, animations: "disabled" });
      const result = {
        page: route.path,
        viewport: viewport.name,
        status: response?.status() ?? null,
        screenshot: `screenshots/${screenshot}`,
        ...metrics,
        consoleErrors,
        pageErrors,
        failedRequests,
        badResponses,
        scriptRequests,
        scriptResponses,
        totalScriptBytes: scriptResponses.reduce((total, response) => total + (response.bytes ?? 0), 0),
        adminAssets: scriptRequests.filter((url) => /_emdash\/admin|PluginRegistry|CodeEditor|InlinePortableTextEditor|replica-BGY|react-dom\./i.test(url)),
      };
      result.issues = [];
      if (result.status !== 200) result.issues.push(`Expected HTTP 200, received ${result.status}`);
      if (result.lang !== "vi") result.issues.push(`Expected lang=vi, received ${result.lang}`);
      if (result.h1Count !== 1) result.issues.push(`Expected one h1, found ${result.h1Count}`);
      if (result.horizontalOverflow) result.issues.push(`Horizontal overflow: ${result.scrollWidth}px document / ${result.clientWidth}px viewport`);
      if (viewport.width <= 800 && !result.menuButtonVisible) result.issues.push("Mobile menu button is not visible at the breakpoint");
      if (viewport.width > 800 && result.menuButtonVisible) result.issues.push("Mobile menu button is visible at desktop width");
      if (viewport.width <= 800 && result.navDisplay !== "none") result.issues.push(`Closed mobile nav should be hidden, received display=${result.navDisplay}`);
      if (viewport.width > 800 && result.navDisplay !== "flex") result.issues.push(`Desktop nav should be visible, received display=${result.navDisplay}`);
      if (["/projects", "/blog", "/contact"].includes(route.path) && result.emptyStateCount === 0) result.issues.push("Expected empty-state message for an unseeded public collection");
      if (result.ctaCount === 0) result.issues.push("No CTA buttons were rendered");
      if (result.missingAltCount > 0) result.issues.push(`${result.missingAltCount} image(s) missing alt text`);
      result.imageCoverage = result.images.length === 0 ? "No published image content in the local seed" : "Checked rendered images";
      if (result.images.some((image) => !image.loaded)) result.issues.push(`${result.images.filter((image) => !image.loaded).length} broken image(s)`);
      if (consoleErrors.length > 0) result.issues.push(`${consoleErrors.length} console error(s)`);
      if (pageErrors.length > 0) result.issues.push(`${pageErrors.length} page error(s)`);
      if (failedRequests.length > 0) result.issues.push(`${failedRequests.length} failed request(s)`);
      if (badResponses.length > 0) result.issues.push(`${badResponses.length} HTTP response(s) >= 400`);
      if (result.adminAssets.length > 0) result.issues.push(`Public route requested ${result.adminAssets.length} admin asset(s)`);
      results.push(result);
      issues.push(...result.issues.map((message) => `${route.path} at ${viewport.name}: ${message}`));
      await page.close();
    }

    if (viewport.name === "390x844") {
      const page = await context.newPage();
      try {
        await page.goto(new URL("/", baseUrl).href, { waitUntil: "networkidle" });
        const button = page.locator(".menu-toggle");
        const visible = await button.isVisible();
        assert.equal(visible, true, "mobile menu button should be visible at 390px");
        await button.click();
        assert.equal(await button.getAttribute("aria-expanded"), "true", "mobile menu should open on click");
        assert.equal(await page.locator("#primary-navigation").isVisible(), true, "mobile navigation should become visible");
        await page.keyboard.press("Escape");
        assert.equal(await button.getAttribute("aria-expanded"), "false", "Escape should close mobile menu");
        await button.click();
        await page.locator('#primary-navigation a[href="/services"]').click();
        await page.waitForURL("**/services");
        assert.equal(await page.locator(".menu-toggle").getAttribute("aria-expanded"), "false", "following a nav link should close the menu");
        mobileNavigation = { status: "pass", opened: true, escapeClosed: true, linkClosed: true };
      } catch (error) {
        mobileNavigation = { status: "fail", error: error instanceof Error ? error.message : String(error) };
        issues.push(`Mobile navigation: ${mobileNavigation.error}`);
      }
      await page.close();
    }

    await context.close();
  }
} finally {
  await browser.close();
}

const report = {
  generatedAt: new Date().toISOString(),
  baseUrl,
  browser: `Chromium ${browserVersion}`,
  viewports: viewports.map(({ name, width, height }) => ({ name, width, height })),
  pages: pages.map(({ path: route }) => route),
  mobileNavigation,
  resultCount: results.length,
  passed: results.filter((result) => result.issues.length === 0).length,
  issues,
  outcome: issues.length === 0 ? "PASS" : "FAIL",
  results,
};

await writeFile(path.join(outDir, "visual-report.json"), `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify({ browser: report.browser, resultCount: report.resultCount, passed: report.passed, mobileNavigation, outcome: report.outcome, issues, report: "docs/qa/visual-report.json" }, null, 2));
if (issues.length > 0) process.exitCode = 1;
