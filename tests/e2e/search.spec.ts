import { expect, test } from "@playwright/test";
import { AxeBuilder } from "@axe-core/playwright";
import { randomUUID } from "node:crypto";
import { createDatabase } from "@/server/db";

const db=createDatabase(process.env.TEST_DATABASE_URL!);
const slug="search-"+randomUUID();
let categoryId:string;
test.beforeAll(async()=>{
  const category=await db.category.create({data:{slug,name:"Cabinetry",description:"QA",image:"/images/products/arca.webp"}});categoryId=category.id;
  await db.product.create({data:{slug,title:"Palatine Cabinet",description:"Lacquered cabinet",dimensions:"QA",material:"Ebonite",categoryId,
    images:{create:{path:"/images/products/arca.webp",alt:"Atelier cabinet"}},
    variants:{create:{sku:slug,finish:"Russet",priceCents:81900,stock:2}}}});
});
test.afterAll(async()=>{
  if(categoryId) await db.$transaction(async tx=>{
    await tx.variant.deleteMany({where:{product:{categoryId}}});await tx.product.deleteMany({where:{categoryId}});await tx.category.delete({where:{id:categoryId}});
  });await db.$disconnect();
});
test("keyboard, focus trap, Escape, empty query and search accessibility",async({page})=>{
  await page.goto("/about");const trigger=page.getByRole("button",{name:"Search products"});await trigger.focus();await page.keyboard.press("Enter");
  const field=page.getByRole("searchbox");await expect(field).toBeFocused();await field.fill("   ");
  await expect(page.getByRole("heading",{name:"Explore collections"})).toBeVisible();
  await page.getByRole("dialog").getByRole("link").last().focus();await page.keyboard.press("Tab");
  // The browser may transiently focus its chrome on wrapping. A second Tab must re-enter the modal.
  await page.keyboard.press("Tab");expect(await page.evaluate(()=>!!document.activeElement?.closest("dialog"))).toBe(true);
  expect((await new AxeBuilder({page}).withTags(["wcag2a","wcag2aa"]).analyze()).violations).toEqual([]);
  await page.keyboard.press("Escape");await expect(trigger).toBeFocused();
});
test("debounces typing, shows real price and thumbnail, bookmarks and remembers a search",async({page})=>{
  await page.goto("/contact");const requests:string[]=[];page.on("request",r=>{if(r.url().includes("view=suggestions"))requests.push(r.url());});
  await page.getByRole("button",{name:"Search products"}).click();const field=page.getByRole("searchbox");await field.pressSequentially("palatine",{delay:15});
  const hit=page.getByRole("dialog").getByRole("link",{name:/Palatine Cabinet/});await expect(hit).toContainText("$819.00");
  await expect(hit).toContainText("Russet");await hit.locator("img").evaluate(i=>(i as HTMLImageElement).decode());
  expect(await hit.locator("img").evaluate(i=>(i as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
  expect(requests).toHaveLength(1);await field.press("Enter");await expect(page).toHaveURL(/shop\?q=palatine/);
  await page.reload();await expect(page.getByRole("heading",{name:"Palatine Cabinet"})).toBeVisible();
  await page.getByRole("button",{name:"Search products"}).click();await page.getByRole("button",{name:"palatine",exact:true}).click();
  await hit.click();await expect(page).toHaveURL(new RegExp("/product/"+slug));await expect(page.getByRole("dialog")).toBeHidden();
});
test("mobile loading, stale responses, empty results and retry",async({page})=>{
  await page.setViewportSize({width:360,height:640});await page.goto("/wishlist");
  let release!:()=>void;const held=new Promise<void>(r=>{release=r;});let started!:()=>void;const pending=new Promise<void>(r=>{started=r;});
  await page.route("**/api/products?view=suggestions&q=delayed",async route=>{started();await held;await route.fulfill({json:{items:[],total:0}}).catch(()=>{});});
  await page.getByRole("button",{name:"Search products"}).click();const field=page.getByRole("searchbox");await field.fill("delayed");
  await pending;await expect(page.getByRole("status")).toContainText("Searching");
  await field.fill("russEt");const hit=page.getByRole("link",{name:/Palatine Cabinet/});await expect(hit).toBeVisible();
  release();await expect(hit).toBeVisible();await field.fill("zzznomatch");await expect(page.getByRole("status")).toContainText("No pieces found");
  await page.route("**/api/products?view=suggestions&q=ebonite",route=>route.fulfill({status:503,json:{}}),{times:1});
  await field.fill("ebonite");await page.getByRole("button",{name:"Try again"}).click();await expect(hit).toBeVisible();
});
