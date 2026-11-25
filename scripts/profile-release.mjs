import {spawn} from 'node:child_process';
import {mkdir,writeFile} from 'node:fs/promises';
import {chromium} from 'playwright';
const stage=process.argv[2];
if(!['before','after'].includes(stage))throw Error('Select before or after');
const origin='http://127.0.0.1:3112';
const server=spawn(process.execPath,['node_modules/next/dist/bin/next','start','--hostname','127.0.0.1','--port','3112'],{windowsHide:true,stdio:'ignore'});
let browser;
try {
 for(let i=0;i<80;i++){try{if((await fetch(origin+'/api/health')).ok)break;}catch{}await new Promise(r=>setTimeout(r,200));}
 browser=await chromium.launch({channel:'msedge'});
 const runs=[];
 for(let i=0;i<3;i++){
 const page=await browser.newPage({viewport:{width:1440,height:900}});
 await page.addInitScript(()=>{window.opening={lcp:0,cls:0};new PerformanceObserver(l=>{for(const e of l.getEntries())window.opening.lcp=e.startTime}).observe({type:'largest-contentful-paint',buffered:true});new PerformanceObserver(l=>{for(const e of l.getEntries())if(!e.hadRecentInput)window.opening.cls+=e.value}).observe({type:'layout-shift',buffered:true})});
 await page.goto(origin);await page.waitForTimeout(3500);
 const sample=await page.evaluate(()=>{const resources=performance.getEntriesByType('resource');const bytes=list=>list.reduce((n,x)=>n+x.transferSize,0);return {...window.opening,transfer:bytes(resources),javascript:bytes(resources.filter(r=>r.name.includes('.js'))),models:bytes(resources.filter(r=>r.name.includes('/models/'))),heap:performance.memory?.usedJSHeapSize}});
 const times=[];for(let n=0;n<8;n++){const t=performance.now();const r=await fetch(origin+'/api/products?q=regent');if(!r.ok)throw Error(String(r.status));await r.json();times.push(performance.now()-t);}
 if(stage==="after"){
   const opened=performance.now();
   await page.getByRole("button",{name:"Search products"}).click();
   await page.getByRole("dialog").getByRole("searchbox").waitFor();
   sample.openAutomationMs=performance.now()-opened;
   const search=performance.now();await page.getByRole("searchbox").fill("regent");
   await page.getByRole("dialog").locator("li a").first().waitFor();sample.liveResultAutomationMs=performance.now()-search;
 }
 runs.push({...sample,apiMedianMs:times.sort((a,b)=>a-b)[4]});await page.close();
 }
 await mkdir('docs/evidence/release',{recursive:true});await writeFile('docs/evidence/release/'+stage+'.json',JSON.stringify(runs,null,2));
}finally{await browser?.close();server.kill();}
