import { spawnSync } from "node:child_process";
import { mkdir } from "node:fs/promises";
import { chromium } from "playwright";
import sharp from "sharp";

const origin = process.env.VEYRAVELUNE_PREVIEW_URL || "http://127.0.0.1:3000";
const ffmpeg = process.env.FFMPEG_PATH || "ffmpeg";
const output = "docs/evidence/release";
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ channel: "msedge" });

try {
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  await page.goto(origin);
  await page.locator(".hero-canvas canvas").waitFor();
  await page.evaluate(() => document.fonts.ready);
  const scrollTo = (value) => page.evaluate((progress) => {
    const film = document.querySelector(".film");
    const distance = film.offsetHeight - innerHeight;
    window.scrollTo({ top: film.offsetTop + distance * progress, behavior: "instant" });
  }, value);

  // Prepare each chapter before taking the portfolio frames.
  for (const [index, fraction] of [0.20, 0.40, 0.58, 0.79, 0.98].entries()) {
    await scrollTo(fraction);
    await page.locator(`.film[data-chapter="${index + 1}"] .hero-canvas[data-rendered=true]`).waitFor();
  }
  const frames = [];
  async function capture(repeat = 1) {
    const screenshot = await page.screenshot({ caret: "hide" });
    const frame = await sharp(screenshot).resize(960, 600).jpeg({ quality: 88 }).toBuffer();
    for (let i = 0; i < repeat; i++) frames.push(frame);
  }

  await scrollTo(0);
  await page.waitForTimeout(800);
  await capture(10);
  for (let step = 1; step <= 96; step++) {
    await scrollTo(step / 96);
    await capture();
  }
  await page.getByRole("link", { name: "Skip to Collections", exact: true }).click();
  await page.locator("#collection").waitFor({ state: "visible" });
  await page.waitForTimeout(300);
  await capture(12);

  const result = spawnSync(ffmpeg, [
    "-hide_banner", "-loglevel", "error", "-y", "-f", "image2pipe", "-framerate", "12",
    "-c:v", "mjpeg", "-i", "pipe:0", "-an", "-c:v", "libvpx-vp9",
    "-b:v", "0", "-crf", "30", "-pix_fmt", "yuv420p", output + "/royal-realm.webm",
  ], { input: Buffer.concat(frames), windowsHide: true });
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(result.stderr.toString());
} finally {
  await browser.close();
}
