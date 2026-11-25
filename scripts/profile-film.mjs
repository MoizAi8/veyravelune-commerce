import { chromium } from "playwright";
import { spawn } from "node:child_process";
import { writeFile } from "node:fs/promises";

const origin="http://127.0.0.1:3115";
const server=spawn(process.execPath,["node_modules/next/dist/bin/next","start","--hostname","127.0.0.1","--port","3115"],{windowsHide:true,stdio:"ignore"});
const label = process.argv[2] || "optimized";
if (!["baseline", "optimized"].includes(label)) throw new Error("Use baseline or optimized.");
let browser;
const runs = [];
try {
  let healthy = false;
  for (let i = 0; i < 80; i++) {
    try { healthy = (await fetch(origin + "/api/health")).ok; } catch { /* Starting. */ }
    if (healthy) break;
    await new Promise(resolve => setTimeout(resolve, 200));
  }
  if (!healthy) throw new Error("The production preview did not become healthy.");
  browser=await chromium.launch({channel:"msedge"});
  for (let run = 0; run < 3; run++) {
  const page=await browser.newPage({viewport:{width:1440,height:900}});
  await page.addInitScript(() => {
    window.slowWebGL = [];
    window.filmPhase = { pass: "startup", step: 0 };
    const api = WebGL2RenderingContext.prototype;
    for (const name of ["compileShader", "linkProgram", "getProgramParameter", "getShaderParameter",
      "texImage2D", "texSubImage2D", "generateMipmap", "drawElements", "drawArrays", "bufferData"]) {
      const original = api[name];
      api[name] = function (...args) {
        const start = performance.now();
        const result = original.apply(this, args);
        const ms = performance.now() - start;
        if (ms >= 8) window.slowWebGL.push({ name, start, ms, ...window.filmPhase });
        return result;
      };
    }
  });
  await page.goto(origin);
  await page.locator(".hero-canvas[data-rendered=true] canvas").waitFor();
  const results=await page.evaluate(async()=>{
    const canvas=document.querySelector(".hero-canvas canvas");
    const gl=canvas.getContext("webgl2");
    const gpuInfo=gl.getExtension("WEBGL_debug_renderer_info");
    const renderer=gpuInfo?gl.getParameter(gpuInfo.UNMASKED_RENDERER_WEBGL):gl.getParameter(gl.RENDERER);
    const film=document.querySelector(".film");
    const samples=[];
    const spikes=[];
    const startupMs = performance.now();
    for(const pass of ["forward","reverse","replay"]){
      const intervals=[];
      let previous=0;
      for(let step=0;step<=160;step++){
        const time=await new Promise(resolve=>requestAnimationFrame(resolve));
        if (previous) {
          const interval = time - previous;
          intervals.push(interval);
          if (interval > 35) spikes.push({pass, step, start:previous, ms:interval});
        }
        window.filmPhase = {pass, step};
        previous=time;
        const fraction=(pass==="reverse"?160-step:step)/160;
        window.scrollTo({top:film.offsetTop+(film.offsetHeight-innerHeight)*fraction,behavior:"instant"});
      }
      intervals.sort((a,b)=>a-b);
      samples.push({pass,frames:intervals.length,medianMs:intervals[80],p95Ms:intervals[151],maxMs:intervals.at(-1)});
    }
    return {renderer,startupMs,samples,spikes,slowWebGL:window.slowWebGL};
  });
  runs.push(results);
  await page.close();
  }
  await writeFile("docs/evidence/release/film-"+label+".json",JSON.stringify(runs,null,2)+"\n");
}finally{await browser?.close();server.kill();}
