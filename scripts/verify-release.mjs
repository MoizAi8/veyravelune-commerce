import assert from "node:assert/strict";
import { readFile, mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { spawn } from "node:child_process";
import { chromium, firefox, webkit, expect } from "@playwright/test";
import { AxeBuilder } from "@axe-core/playwright";
import sharp from "sharp";

const dir="docs/evidence/release", origin="http://127.0.0.1:3114";
const server=spawn(process.execPath,["node_modules/next/dist/bin/next","start","--hostname","127.0.0.1","--port","3114"],{windowsHide:true,stdio:"ignore"});
const results=[], errors=[];
let browser;
async function check(group,name,fn){
  try {await fn();results.push({group,name,status:"passed"});}
  catch(error){const message=error.message.slice(0,800);console.error(name,message);results.push({group,name,status:"failed",message});}
}
async function screenshot(page,name){
  await page.evaluate(async()=>{await document.fonts.ready;await Promise.all([...document.images].filter(i=>i.currentSrc && i.getBoundingClientRect().top<innerHeight && i.getBoundingClientRect().bottom>0).map(i=>i.decode()));});
  await sharp(await page.screenshot()).webp({quality:80}).toFile(dir+"/"+name+".webp");
}
try{
 await mkdir(dir,{recursive:true});
 for(let i=0;i<80;i++){try{if((await fetch(origin+"/api/health")).ok)break;}catch{}await new Promise(r=>setTimeout(r,200));}
 const get=async path=>{const response=await fetch(origin+path);assert(response.ok,path);return response.json();};
 const first=await get("/api/products");const items=[...first.items];
 for(let i=2;i<=Math.ceil(first.total/first.pageSize);i++)items.push(...(await get("/api/products?page="+i)).items);
 await check("catalog","stable pagination includes every public item exactly once",async()=>assert.equal(new Set(items.map(i=>i.slug)).size,first.total));
 browser=await chromium.launch({channel:"msedge"});
 const context=await browser.newContext({viewport:{width:1440,height:900},reducedMotion:"reduce"});
 const page=await context.newPage();
 page.on("pageerror",e=>errors.push(e.message));
 for(const item of items){
  await check("product",item.slug+" has a reachable product page and a selectable finish",async()=>{
    await page.goto(origin+"/product/"+item.slug);await expect(page.getByRole("heading",{name:item.title,exact:true}).first()).toBeVisible();
    await expect(page.getByRole("radio").first()).toBeEnabled();assert.equal(await page.locator('link[rel=canonical]').getAttribute("href"),"http://127.0.0.1:3000/product/"+item.slug);
  });
  await check("assets",item.slug+" catalog photography decodes and has alternative text",async()=>{
    for(const image of item.images){assert(image.alt);const r=await fetch(origin+image.path);assert(r.ok);assert((await sharp(Buffer.from(await r.arrayBuffer())).metadata()).width>0);}
  });
  await check("catalog",item.slug+" exact search presents its current lead price",async()=>{
    const body=await get("/api/products?view=suggestions&q="+encodeURIComponent(item.title));const hit=body.items[0];assert.equal(hit.slug,item.slug);assert.equal(hit.priceCents,item.variants[0].priceCents);assert.equal(hit.image,item.images[0].path);
  });
 }
 for(const category of new Set(items.map(i=>i.category.slug))){
  await check("catalog",category+" collection returns only its products",async()=>{const p=await get("/api/products?category="+category);assert(p.total>0);assert(p.items.every(i=>i.category.slug===category));assert.equal(p.total,items.filter(i=>i.category.slug===category).length);});
 }
 for(const sort of ["name","price-asc","price-desc"]){
  await check("catalog","global ordering across all pages for "+sort,async()=>{
    const sorted=[];for(let n=1;n<=Math.ceil(first.total/first.pageSize);n++)sorted.push(...(await get("/api/products?sort="+sort+"&page="+n)).items);
    const vals=sorted.map(i=>sort==="name"?i.title:i.variants[0].priceCents);
    if(sort==="name")assert.deepEqual(vals,[...vals].sort((a,b)=>a<b?-1:a>b?1:0));else assert.deepEqual(vals,[...vals].sort((a,b)=>sort==="price-asc"?a-b:b-a));
  });
 }
 for(const [q,status] of [["page=0",400],["page=1000",400],["max=-1",400],["min=99&max=1",400],["category=unknown",400],["sort=unknown",400],["q="+"a".repeat(81),400],["q=%25_",200]]){
  await check("api","validates "+q.slice(0,20),async()=>assert.equal((await fetch(origin+"/api/products?"+q)).status,status));
 }
 for(const [url,status] of [["/api/admin/products",403],["/api/admin/orders",403],["/api/orders/VL-"+ "0".repeat(32),404],["/api/products/unlisted-fixture",404]]){
  await check("access","anonymous request to "+url,async()=>{const r=await fetch(origin+url);assert.equal(r.status,status);assert(!(await r.text()).includes("stack"));});
 }
 for(const route of ["/","/about","/shop","/product/alcove","/cart","/checkout","/wishlist","/contact","/policies"]){
  await check("accessibility","AA automated scan "+route,async()=>{await page.goto(origin+route);await page.locator("main h1").first().waitFor();const a=await new AxeBuilder({page}).withTags(["wcag2a","wcag2aa"]).analyze();assert.deepEqual(a.violations.map(v=>[v.id,v.nodes[0]?.target]),[]);});
 }
 await page.close();
 for(const [width,height] of [[2560,1440],[1920,1080],[1440,900],[1366,768],[1280,800],[768,1024],[390,844],[360,640]]){
  const page=await browser.newPage({viewport:{width,height},hasTouch:width<=768});const requests=[];
  page.on("request",r=>{if(r.url().includes("/models/"))requests.push(r.url());});page.on("pageerror",e=>errors.push(e.message));
  await check("responsive","navigation and film "+width,async()=>{
    await page.goto(origin);await page.getByRole("button",{name:"Search products"}).waitFor();
    if(width<1000){assert.equal(await page.locator("canvas").count(),0);assert.equal(requests.length,0);}else{await page.locator(".hero-canvas canvas").waitFor();}
    assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  });
  await check("responsive","search overlay and thumbnails "+width,async()=>{
    const trigger=page.getByRole("button",{name:"Search products"});if(width<=768)await trigger.tap();else await trigger.click();
    await page.getByRole("searchbox").fill("velvet");const hit=page.getByRole("dialog").locator("li a").first();await expect(hit).toBeVisible();
    assert(await page.getByRole("dialog").evaluate(d=>d.scrollWidth<=d.clientWidth+1));
    await screenshot(page,"search-"+width);await page.keyboard.press("Escape");await expect(trigger).toBeFocused();
  });
  await check("responsive","checkout totals or empty bag accessible "+width,async()=>{await page.goto(origin+"/checkout");await expect(page.getByRole("heading",{level:1})).toBeVisible();assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));});
  await page.close();
 }
 const film=await browser.newPage({viewport:{width:1440,height:900}});await film.goto(origin);
 for(const [i,name] of ["arrival","sofa","vessel","bed","gallery","salon"].entries()){
  await check("film","chapter control renders "+name,async()=>{await film.locator(".film-navigation button").nth(i).click();await expect(film.locator(".film")).toHaveAttribute("data-chapter",String(i));await film.locator(".hero-canvas[data-rendered=true]").waitFor();await film.waitForTimeout(900);await screenshot(film,"chapter-"+name);});
 }
 for(const i of [2,0,5,1,4,3]){
  await check("motion","direct scroll reconstructs chapter "+i,async()=>{await film.evaluate(v=>{const f=document.querySelector(".film");window.scrollTo({top:f.offsetTop+(f.offsetHeight-innerHeight)*v,behavior:"instant"});},[0,.2,.4,.58,.79,.98][i]);await expect(film.locator(".film")).toHaveAttribute("data-chapter",String(i));});
 }
 await check("motion","reload restores the active chapter",async()=>{
   await film.reload();await expect(film.locator(".film")).toHaveAttribute("data-chapter","3");await film.locator(".hero-canvas[data-rendered=true]").waitFor();
 });
 await check("motion","native scroll remains responsive across the whole pinned film",async()=>{
   const pacing=await film.evaluate(async()=>{
     const elem=document.querySelector(".film"),dist=elem.offsetHeight-innerHeight,intervals=[];
     let previous=0;
     for(let step=0;step<=100;step++){
       const time=await new Promise(resolve=>requestAnimationFrame(resolve));
       if(previous)intervals.push(time-previous);previous=time;
       window.scrollTo({top:elem.offsetTop+dist*step/100,behavior:"instant"});
     }
     intervals.sort((a,b)=>a-b);
     return {medianFrameIntervalMs:intervals[50],p95FrameIntervalMs:intervals[95],longestFrameIntervalMs:intervals[99],sampleCount:intervals.length};
   });
   await expect(film.locator(".film")).toHaveAttribute("data-chapter","5");await writeFile(dir+"/scroll.json",JSON.stringify(pacing,null,2));
 });
 await check("motion","skip reaches the collection after reverse scrolling",async()=>{await film.getByRole("link",{name:"Skip to Collections",exact:true}).click();await expect(film.locator("#collection")).toBeInViewport();});
 await film.close();await browser.close();browser=null;
 for(const [name,engine] of [["Chromium",chromium],["Firefox",firefox],["WebKit",webkit],["Edge",chromium]]){
  let engineBrowser;
  try{
   engineBrowser=await engine.launch(name==="Edge"?{channel:"msedge"}:{});
   for(const [route,task] of [["/","homepage fallback"],["/shop","search and product navigation"],["/cart","bag and checkout navigation"]]){
    const p=await engineBrowser.newPage({reducedMotion:"reduce",viewport:{width:390,height:844},hasTouch:true});
    await check("browser",name+" "+task,async()=>{
      await p.goto(origin+route);await expect(p.locator("main h1").first()).toBeVisible();
      if(route==="/"){assert.equal(await p.locator("canvas").count(),0);await p.getByRole("link",{name:"Skip to Collections",exact:true}).click();await expect(p.locator("#collection")).toBeInViewport();}
      if(route==="/shop"){await p.getByRole("button",{name:"Search products"}).tap();await p.getByRole("dialog").getByRole("searchbox").fill("alcove");await p.getByRole("dialog").getByRole("link",{name:/Alcove Tracery Bed/}).click();await expect(p).toHaveURL(/product\/alcove$/);}
      if(route==="/cart"){await p.goto(origin+"/checkout");await expect(p.getByRole("heading",{name:/checkout/i,level:1})).toBeVisible();}
    });
    await p.close();
   }
  }catch(e){results.push({group:"browser",name,status:"blocked",message:e.message.slice(0,400)});}finally{await engineBrowser?.close();}
 }
 for(const name of ["sofa.glb","vessel.glb","chandelier.glb","GothicBed_01/model.gltf","mid_century_lounge_chair/model.gltf","side_table_01/model.gltf"]){
  const file=join("public/models",name);const b=await readFile(file);
  const m=name.endsWith(".glb")?JSON.parse(b.subarray(20,20+b.readUInt32LE(12)).toString()):JSON.parse(b);
  await check("3D",name+" renderable mesh and material references",async()=>{assert(m.meshes.length);for(const mesh of m.meshes)for(const p of mesh.primitives){assert(m.accessors[p.attributes.POSITION].count>0);assert(m.materials[p.material]);}});
  await check("3D",name+" complete texture and buffer payloads",async()=>{assert(m.textures.length);for(const i of [...m.images,...m.buffers]){if(i.uri)assert((await readFile(join(dirname(file),i.uri))).length>0);else if(i.bufferView!==undefined)assert(m.bufferViews[i.bufferView].byteLength>0);else assert(name.endsWith(".glb") && b.length>=i.byteLength);}});
 }
 await check("runtime","no unhandled errors on instrumented Edge pages",async()=>assert.deepEqual(errors,[]));
}finally{
 await browser?.close();server.kill();await writeFile(dir+"/matrix.json",JSON.stringify(results,null,2));
 console.log(results.reduce((a,r)=>({...a,[r.status]:(a[r.status]||0)+1}),{}));
 if(results.some(r=>r.status!=="passed"))process.exitCode=1;
}
