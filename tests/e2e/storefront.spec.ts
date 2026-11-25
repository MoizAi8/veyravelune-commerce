import { AxeBuilder } from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { randomBytes, randomUUID } from "node:crypto";
import type { Page } from "@playwright/test";
import { createDatabase } from "@/server/db";
import { hashPassword } from "@/server/auth/password";

const store = createDatabase(process.env.TEST_DATABASE_URL!);
const tag = randomUUID().slice(0, 8);
const email = tag + "@example.invalid";
const password = randomBytes(24).toString("hex");
const customer = "customer-" + email;
const testSku = "BROWSER-" + tag.toUpperCase();
const pieceTitle = "The Aster Study";
const slug = "browser-piece-" + tag;
let productId: string;
let variantId: string;
let categoryId: string;
let actorId: string;
async function capture(page: Page, name: string) {
  if (process.env.PORTFOLIO_SCREENSHOTS === "1") {
    await page.evaluate(async () => {
      await document.fonts.ready;
      const visible = [...document.images].filter((image) => {
        const rect = image.getBoundingClientRect();
        return rect.height > 0 && rect.bottom > 0 && rect.top < innerHeight;
      });
      await Promise.allSettled(visible.map((image) => image.decode()));
    });
    await page.screenshot({ path: "test-results/portfolio/" + name + ".png", animations: "disabled", caret: "initial" });
  }
}
test.beforeAll(async () => {
  const category = await store.category.findUnique({ where: { slug: "seating" } }) ??
    await store.category.create({ data: { slug: "seating", name: "Seating", description: "Fixture", image: "/images/products/regent.webp" } });
  categoryId = category.id;
  const piece = await store.product.create({ data: {
    categoryId, slug, title: pieceTitle, description: "A curved velvet sofa on antique brass feet. Studio edition " + tag + ".", material: "Velvet", dimensions: "244 × 104 × 77 cm",
    featured: true, images: { create: { path: "/images/products/regent.webp", alt: "Emerald test sofa" } },
    variants: { create: [{ sku: testSku, stock: 7, finish: "Emerald", priceCents: 200100 },
      { sku: testSku + "-01", stock: 5, finish: "Merlot", priceCents: 190000 }] },
  }, include: { variants: true } });
  productId = piece.id;
  variantId = piece.variants.find((variant) => variant.sku === testSku)!.id;
  const passwordHash = await hashPassword(password);
  actorId = (await store.user.create({ data: { email, passwordHash, role: "ADMIN" } })).id;
  await store.user.create({ data: { email: customer, passwordHash, role: "CUSTOMER" } });
});
test.afterAll(async () => {
  try {
    await store.$transaction(async (tx) => {
      if (productId) {
        const fixtureVariant = { variant: { productId } };
        const orders = await tx.orderItem.findMany({ where: fixtureVariant, select: { orderId: true }, distinct: ["orderId"] });
        const orderId = { in: orders.map((order) => order.orderId) };
        await tx.inventoryMovement.deleteMany({ where: { OR: [fixtureVariant, { orderId }] } });
        await tx.orderItem.deleteMany({ where: { orderId } });
        await tx.order.deleteMany({ where: { id: orderId } });
        await tx.variant.deleteMany({ where: { productId } });
        await tx.product.delete({ where: { id: productId } });
      }
      await tx.user.deleteMany({ where: { email: { in: [email, customer] } } });
    });
  } finally {
    await store.$disconnect();
  }
});

test("home to filtered detail, saved pieces, persisted bag, private demo order and authenticated admin", async ({ page, browser, baseURL }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "The Royal Realm." })).toBeVisible();
  await capture(page, "desktop-home");
  await page.getByRole("link", { name: "Explore the collection" }).click();
  const desktopFilters = page.getByRole("form", { name: "Filter the collection" });
  await desktopFilters.getByRole("searchbox", { name: "Search" }).fill(tag);
  await desktopFilters.getByLabel("Category").selectOption("seating");
  await desktopFilters.getByRole("button", { name: "Apply filters" }).click();
  await expect(page).toHaveURL(/q=/);
  await page.getByRole("link", { name: new RegExp(pieceTitle) }).click();
  await expect(page).toHaveURL(new RegExp("/product/" + slug + "$"));
  await expect(page.getByRole("heading", { name: pieceTitle, level: 1 })).toBeVisible();
  await page.getByRole("radio", { name: "Emerald" }).check();
  await expect(page.getByText(new RegExp("SKU " + testSku + " ·"))).toBeVisible();
  await page.evaluate(() => window.scrollTo(0, 0));
  await capture(page, "product");
  await page.getByRole("button", { name: "Enlarge product image" }).click();
  await expect(page.getByRole("dialog", { name: "Enlarged product image" })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("button", { name: "Enlarge product image" })).toBeFocused();
  await page.getByRole("button", { name: "Save this piece" }).click();
  await page.getByRole("link", { name: "Saved", exact: true }).click();
  await expect(page.getByRole("heading", { name: pieceTitle })).toBeVisible();
  const finishes = page.getByRole("group", { name: "Finish" });
  await expect(finishes.getByRole("radio", { name: "Merlot" })).toBeChecked();
  await finishes.getByRole("radio", { name: "Emerald" }).check();
  await expect(page.getByText(new RegExp("SKU " + testSku + " ·"))).toBeVisible();
  await page.getByLabel("Quantity").selectOption("2");
  await page.getByRole("button", { name: "Add to bag" }).click();
  await page.getByRole("button", { name: /^Bag/ }).click();
  await expect(page.getByRole("dialog", { name: "Your bag" })).toBeVisible();
  await page.getByRole("link", { name: "View full bag" }).click();
  await expect(page).toHaveURL(/\/cart$/);
  const failQuote = (route: import("@playwright/test").Route) => route.abort("failed");
  await page.route("**/api/cart/quote", failQuote, { times: 1 });
  await page.reload();
  await expect(page.getByRole("button", { name: "Refresh quote" })).toBeVisible();
  await page.getByRole("button", { name: "Refresh quote" }).click();
  await expect(page.getByLabel("Quantity for " + pieceTitle)).toHaveValue("2");
  await capture(page, "bag");
  await page.getByRole("link", { name: "Continue to demo checkout" }).click();
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByLabel("Fictional destination").selectOption("Silvermere");
  await page.getByRole("checkbox", { name: /creates no charge/ }).check();
  expect((await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa"]).analyze()).violations).toEqual([]);
  await capture(page, "checkout-filled-mobile");
  await page.getByRole("button", { name: "Place demo order" }).click();
  await expect(page.getByRole("heading", { name: "Your demo order is recorded." })).toBeVisible();
  const confirmation = page.url();
  const reference = confirmation.split("/").at(-1)!;
  await page.reload();
  await expect(page.getByText(reference, { exact: true })).toBeVisible();
  await capture(page, "confirmation-mobile");
  await page.setViewportSize({ width: 1440, height: 900 });
  await capture(page, "confirmation");
  const privateRead = await page.request.get("/api/orders/" + reference);
  expect(privateRead.status()).toBe(200);
  expect(privateRead.headers()["cache-control"]).toContain("no-store");
  expect((await privateRead.json()).totalCents).toBe(400200);
  const other = await browser.newContext({ baseURL });
  try {
    expect((await other.request.get("/api/orders/" + reference)).status()).toBe(404);
    expect((await other.request.get("/api/admin/orders")).status()).toBe(403);
    expect((await other.request.post("/api/cart/quote", { headers: { Origin: "https://example.invalid" }, data: { items: [{ variantId, quantity: 1 }] } })).status()).toBe(403);
    expect((await other.request.post("/api/cart/quote", { headers: { Origin: baseURL! }, data: { items: [{ variantId, quantity: -1 }] } })).status()).toBe(400);
    expect((await other.request.post("/api/admin/inventory", { headers: { Origin: baseURL! }, data: { variantId, delta: 1, reason: "Browser fixture" } })).status()).toBe(403);
    const visitor = await other.newPage();
    await visitor.goto("/admin");
    await expect(visitor).toHaveURL(/admin\/sign-in$/);
    await visitor.getByLabel("Email").fill(customer);
    await visitor.getByLabel("Password").fill(password);
    await visitor.getByRole("button", { name: "Sign in" }).click();
    await expect(visitor.getByRole("alert").filter({ hasText: "Unable to sign in" })).toBeVisible();
  } finally { await other.close(); }
  await page.goto("/admin/sign-in");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page.getByRole("heading", { name: "Atelier administration" })).toBeVisible();
  await expect(page.getByText(new RegExp(reference + " · PLACED"))).toBeVisible();
  await page.getByText(new RegExp(reference + " · PLACED")).click();
  await page.getByRole("button", { name: "Mark processing" }).click();
  await expect(page.getByText(new RegExp(reference + " · PROCESSING"))).toBeVisible();
  await page.getByText(pieceTitle + " · Active", { exact: true }).click();
  const variantPanel = page.locator("details").filter({
    has: page.locator("summary").filter({ hasText: new RegExp("^" + testSku + " · Emerald · Stock 5$") }),
  }).last();
  await variantPanel.locator("summary").click();
  await variantPanel.getByLabel("Stock change").fill("1");
  await variantPanel.getByLabel("Adjustment reason").fill("Browser fixture restock");
  await variantPanel.getByRole("button", { name: "Adjust stock" }).click();
  await expect(page.getByText(testSku + " · Emerald · Stock 6", { exact: true })).toBeVisible();
  expect(await store.inventoryMovement.count({ where: { actorId, variantId, delta: 1 } })).toBe(1);
  await capture(page, "admin");
  await page.getByRole("button", { name: "Sign out" }).click();
  await expect(page).toHaveURL(/admin\/sign-in$/);
});

test("responsive poster, keyboard navigation, accessible landmarks and empty results", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  for (const width of [360, 390, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 850 });
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    expect(await page.locator("body").evaluate((body) => body.scrollWidth)).toBeLessThanOrEqual(width);
    await expect(page.locator(".film-poster img").first()).toBeVisible();
    await expect(page.locator(".hero-canvas canvas")).toHaveCount(0);
    await expect(page.getByRole("navigation", { name: "Film chapters" })).toBeHidden();
    if (width === 390) await capture(page, "mobile-home");
  }
  await page.keyboard.press("Tab");
  await expect(page.getByRole("link", { name: "Skip to content" })).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.locator("main")).toBeFocused();
  expect((await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa"]).analyze()).violations).toEqual([]);
  await page.goto("/shop?q=does-not-exist-" + tag);
  await expect(page.getByRole("heading", { name: "No pieces found" })).toBeVisible();
  expect((await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa"]).analyze()).violations).toEqual([]);
  await page.setViewportSize({ width: 390, height: 844 });
  const filter = page.getByRole("button", { name: "Filter and sort" });
  await filter.click();
  const sheet = page.getByRole("dialog", { name: "Filter and sort" });
  await expect(sheet).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(filter).toBeFocused();
  await filter.click();
  await sheet.getByRole("searchbox", { name: "Search" }).fill(tag);
  await sheet.getByRole("button", { name: "Apply filters" }).click();
  await expect(page).toHaveURL(new RegExp("q=" + tag));
  await expect(page.getByRole("heading", { name: pieceTitle })).toBeVisible();
});

test("the default WebGL film follows forward and reverse scroll, reveals all six chapters and handles context loss", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  const renderErrors: string[] = [];
  page.on("pageerror", (error) => renderErrors.push(error.message));
  page.on("console", (message) => { if (message.type() === "error") renderErrors.push(message.text()); });
  const files = ["sofa", "vessel", "chandelier"].map((name) =>
    page.waitForResponse((response) => response.url().endsWith("/models/" + name + ".glb") && response.ok()));
  await page.goto("/");
  await files[0];
  await expect(page.locator(".hero-canvas")).toHaveAttribute("data-rendered", "true");
  const canvas = page.locator(".hero-canvas canvas");
  await page.getByRole("button", {name:"The Sovereign Sofa"}).click();
  await expect(page.getByRole("heading", {name:"The Sovereign Sofa."})).toBeVisible();
  const arrival = await canvas.screenshot();
  await capture(page, "sofa-study");
  await page.evaluate(() => {
    const film = document.getElementById("experience")!;
    window.scrollTo(0, film.offsetTop + (film.offsetHeight - innerHeight) * 0.47);
  });
  await files[1];
  await expect(page.getByRole("link", { name: "Explore the Umbra Vessel" })).toBeVisible();
  await expect(page.locator(".hero-canvas")).toHaveAttribute("data-rendered", "true");
  const shifted = await canvas.screenshot();
  expect(shifted.equals(arrival)).toBe(false);
  await capture(page, "vase-study");
  await page.getByRole("button", {name:"The Private Sanctuary"}).click();
  await expect(page.getByRole("heading", {name:"The private sanctuary."})).toBeVisible();
  await expect(page.locator(".hero-canvas")).toHaveAttribute("data-rendered","true");
  await page.getByRole("button", { name: "The Illumination" }).click();
  await Promise.all(files);
  await expect(page.getByRole("heading", { name: "A room set aglow." })).toBeVisible();
  await expect(page.locator(".hero-canvas")).toHaveAttribute("data-rendered", "true");
  expect((await canvas.screenshot()).equals(shifted)).toBe(false);
  await capture(page, "chandelier-study");
  await page.getByRole("button", { name: "Enter the Realm" }).click();
  await expect(page.locator(".film")).toHaveAttribute("data-chapter", "5");
  await expect(page.locator(".hero-canvas")).toHaveCSS("opacity", "0");
  await capture(page, "realm-study");
  await page.evaluate(() => window.scrollTo(0, 0));
  await expect(page.getByRole("heading", { name: "The Royal Realm." })).toBeVisible();
  await page.getByRole("button", { name: "View stills" }).click();
  await expect(canvas).toHaveCount(0);
  await page.getByRole("button", { name: "Play in 3D" }).click();
  await expect(page.locator(".hero-canvas")).toHaveAttribute("data-rendered", "true");
  await page.setViewportSize({ width: 768, height: 900 });
  await expect(canvas).toHaveCount(0);
  await page.setViewportSize({ width: 1440, height: 900 });
  await expect(page.locator(".hero-canvas")).toHaveAttribute("data-rendered", "true");
  expect(renderErrors).toEqual([]);
  await canvas.evaluate((node) => {
    const extension = (node as HTMLCanvasElement).getContext("webgl2")?.getExtension("WEBGL_lose_context");
    if (extension) extension.loseContext();
    else node.dispatchEvent(new Event("webglcontextlost", { cancelable: true }));
  });
  await expect(page.getByText(/3D unavailable/)).toBeVisible();
  await expect(page.locator(".film-poster img").first()).toBeVisible();
});

test("desktop with WebGL disabled still reaches the collection", async ({ page }) => {
  await page.addInitScript(() => {
    const getContext = HTMLCanvasElement.prototype.getContext;
    Object.defineProperty(HTMLCanvasElement.prototype, "getContext", { value: function (this: HTMLCanvasElement, name: string, ...args: unknown[]) {
      if (name.startsWith("webgl")) return null;
      return Reflect.apply(getContext, this, [name, ...args]);
    } });
  });
  await page.goto("/");
  await expect(page.getByText(/3D unavailable/)).toBeVisible();
  await expect(page.locator(".hero-canvas canvas")).toHaveCount(0);
  await page.getByRole("link", { name: "Explore the collection" }).click();
  await expect(page.getByRole("heading", { name: "Pieces with presence." })).toBeVisible();
});

test("the redesigned contact form validates a sample inquiry", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/contact");
  await expect(page.getByRole("heading", { name: "Contact", level: 1 })).toBeVisible();
  await page.getByLabel("Inquiry topic").selectOption("Dimensions");
  await page.getByRole("checkbox", { name: /submitting a sample inquiry/ }).check();
  await page.getByRole("button", { name: "Validate sample inquiry" }).click();
  await expect(page.getByRole("status").filter({ hasText: "Your sample inquiry passed validation." })).toBeVisible();
});
