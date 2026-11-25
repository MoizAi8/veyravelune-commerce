import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { chromium } from 'playwright';
import sharp from 'sharp';
const output='docs/screenshots/royal-realm';
await mkdir(output,{recursive:true});
const origin=process.env.VEYRAVELUNE_PREVIEW_URL || 'http://127.0.0.1:3000';
const browser=await chromium.launch({channel:'msedge'});
const results=[];
async function save(page,name){
  await page.evaluate(async()=>{await document.fonts.ready;await Promise.all([...document.images].filter(i=>i.currentSrc && i.getBoundingClientRect().bottom>0 && i.getBoundingClientRect().top<innerHeight).map(i=>i.decode()));});
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'Overflow '+name);
  await sharp(await page.screenshot()).webp({quality:85}).toFile(output+'/'+name+'.webp');
}
try{
 for(const [width,height] of [[1440,900],[390,844],[768,1024],[1280,800],[1920,1080]]){
  const page=await browser.newPage({viewport:{width,height}});
  const errors=[],assets=[];
  page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.url().includes('/models/'))assets.push(r.status());if(r.status()>=400 && r.url().startsWith(origin))errors.push(r.status()+' '+r.url());});
  await page.addInitScript(()=>{
    window.realmMetrics={lcp:null,cls:0};
    new PerformanceObserver(list=>{for(const entry of list.getEntries())window.realmMetrics.lcp=entry.startTime;}).observe({type:'largest-contentful-paint',buffered:true});
    new PerformanceObserver(list=>{for(const entry of list.getEntries())if(!entry.hadRecentInput)window.realmMetrics.cls+=entry.value;}).observe({type:'layout-shift',buffered:true});
  });
  await page.goto(origin);await page.waitForTimeout(1200);
  if(width>=1000)await page.locator('.hero-canvas canvas').waitFor();
  await save(page,'arrival-'+width);
  const openingMetrics=await page.evaluate(()=>window.realmMetrics);
  if(width===1440){
    for(const [i,scene] of ['sofa','vessel','sanctuary','gallery','house'].entries()){
      await page.locator('.film-navigation button').nth(i+1).click();
      await page.waitForFunction(n=>document.querySelector('.film')?.dataset.chapter===String(n),i+1);
      await page.locator('.hero-canvas[data-rendered=true]').waitFor();await page.waitForTimeout(1100);
      await save(page,scene);
    }
    await page.getByRole('link',{name:'Skip to Collections',exact:true}).click();
    await page.waitForTimeout(550);await save(page,'collections');
    for(const [selector,name] of [['.sanctuary-spread','bedroom-spread'],['.material-study','materials'],['.realm-editorial','interiors']]){
      await page.locator(selector).scrollIntoViewIfNeeded();await save(page,name);
    }
    await page.goto(origin+'/product/alcove');await page.getByRole('heading',{name:'Alcove Tracery Bed'}).waitFor();
    await save(page,'alcove-product');
    await page.goBack();await page.reload();await page.getByRole('link',{name:'Skip to Collections',exact:true}).waitFor();
    const frames=[];
    for(let index=0;index<=36;index++){
      await page.evaluate(value=>{const film=document.querySelector('.film');window.scrollTo({top:film.offsetTop+(film.offsetHeight-innerHeight)*value,behavior:'instant'});},index/36);
      await page.waitForTimeout(85);frames.push(await sharp(await page.screenshot()).resize(720,450).png().toBuffer());
    }
    await sharp(frames,{join:{animated:true}}).webp({delay:130,loop:0,quality:69}).toFile(output+'/journey.webp');
  }
  if(width===1440 || width===390){
    for(const route of ['shop?category=bedroom','wishlist','cart','checkout','about','contact']){
      await page.goto(origin+'/'+route);
      if(route.startsWith("shop?"))await page.getByRole("heading",{name:"Alcove Tracery Bed"}).waitFor();
      await save(page,route.split('?')[0]+'-'+width);
    }
  }
  if(width<1000){assert.equal(assets.length,0);assert.equal(await page.locator('canvas').count(),0);}
  else assert(assets.length>0 && assets.every(s=>s>=200&&s<400));
  assert.deepEqual(errors,[]);results.push({width,height,modelRequests:assets.length,openingMetrics});await page.close();
 }
 await writeFile(output+'/checks.json',JSON.stringify(results,null,2));
}finally{await browser.close();}
