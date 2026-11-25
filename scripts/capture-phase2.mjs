import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";
import { join } from "node:path";
import { chromium } from "playwright";
import sharp from "sharp";

const origin = process.env.VEYRAVELUNE_PREVIEW_URL || "http://127.0.0.1:3000";
const output = process.argv[2] || "docs/screenshots/phase2";
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ channel: process.env.PLAYWRIGHT_CHANNEL || "msedge" });
const screenshots = [];
let renderer;

async function capture(page, name) {
  const size = page.viewportSize();
  await page.evaluate(async () => {
    await document.fonts.ready;
    const viewportImages = [...document.images].filter((image) => {
      const box = image.getBoundingClientRect();
      return box.width > 0 && box.bottom > 0 && box.top < innerHeight && Boolean(image.getAttribute("src"));
    });
    await Promise.all(viewportImages.map((image) => image.decode()));
  });
  assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), "Horizontal overflow in " + name);
  const screenshot = await page.screenshot({ caret: "initial" });
  await sharp(screenshot).webp({ quality: 88 }).toFile(join(output, name + ".webp"));
  screenshots.push({ name, dimensions: size.width + "×" + size.height });
}

try {
  for (const [width, height] of [[1920,1080], [1440,900], [1280,800], [768,1024], [390,844]]) {
    const page = await browser.newPage({ viewport: { width, height } });
    const failures = [];
    const modelLoads = [];
    page.on("pageerror", (error) => failures.push(error.message));
    page.on("console", (entry) => { if (entry.type() === "error") failures.push(entry.text()); });
    page.on("response", (response) => { if (response.url().includes("/models/")) modelLoads.push(response.status()); });
    await page.goto(origin, { waitUntil: "load" });
    if (width >= 1000) {
      await page.locator(".hero-canvas[data-rendered=true] canvas").waitFor({ timeout: 30000 });
      renderer = await page.locator("canvas").evaluate((canvas) => {
        const gl = canvas.getContext("webgl2");
        const info = gl?.getExtension("WEBGL_debug_renderer_info");
        return info ? gl.getParameter(info.UNMASKED_RENDERER_WEBGL) : gl?.getParameter(gl.RENDERER);
      });
      await page.waitForTimeout(1250);
    }
    await capture(page, "home-" + width + "x" + height);
    if (width === 1440) {
      for (const [name, scene, time] of [["artifacts",1,0.48], ["illumination",2,0.76], ["realm",3,0.98]]) {
        await page.evaluate((progress) => {
          const film = document.getElementById("experience");
          window.scrollTo(0, film.offsetTop + (film.offsetHeight - innerHeight) * progress);
        }, time);
        await page.locator('.film[data-chapter="' + scene + '"]').waitFor();
        await page.locator(".hero-canvas[data-rendered=true]").waitFor();
        if (scene === 3) await page.waitForFunction(() => Number(getComputedStyle(document.querySelector(".hero-canvas")).opacity) === 0);
        await page.waitForTimeout(950);
        await capture(page, "film-" + name);
      }
      await page.locator("#collection").evaluate((section) => section.scrollIntoView({ block: "start" }));
      await capture(page, "home-collections");
    }
    if (width === 390) {
      await page.locator(".film-mobile-card").first().evaluate((section) => section.scrollIntoView({ block: "start" }));
      await capture(page, "home-mobile-chapters");
    }
    if (width < 1000) {
      assert.equal(await page.locator("canvas").count(), 0);
      assert.deepEqual(modelLoads, []);
    } else {
      assert(modelLoads.length >= 3 && modelLoads.every((status) => status >= 200 && status < 300), "Missing model responses");
    }
    assert.deepEqual(failures, [], "Rendering errors at " + width);
    await page.close();
  }

  for (const [width, height] of [[1440,900], [390,844]]) {
    const page = await browser.newPage({ viewport: { width, height } });
    const failures = [];
    page.on("pageerror", (error) => failures.push(error.message));
    page.on("console", (entry) => { if (entry.type() === "error") failures.push(entry.text()); });
    for (const [name, path] of Object.entries({ shop: "/shop", lighting: "/shop?category=lighting",
      product: "/product/regent", saved: "/wishlist", bag: "/cart", checkout: "/checkout", about: "/about", contact: "/contact" })) {
      const response = await page.goto(origin + path, { waitUntil: "networkidle" });
      assert.equal(response.status(), 200, path);
      await page.locator("main h1").waitFor();
      if (name === "bag" || name === "checkout") await page.locator(".bag-empty").waitFor();
      if (name === "saved") await page.locator(".saved-empty").waitFor();
      await capture(page, name + "-" + width);
      assert.deepEqual(failures, [], "Rendering errors on " + path);
    }
    await page.close();
  }
  console.log(JSON.stringify({ renderer, screenshots }, null, 2));
} finally {
  await browser.close();
}
