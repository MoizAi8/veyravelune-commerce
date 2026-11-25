import { expect, test } from "@playwright/test";
import { randomUUID } from "node:crypto";

const origin="http://127.0.0.1:3100";
const variantId=randomUUID();
const line={variantId,quantity:1};
const quote="/api/cart/quote",contact="/api/contact";

for(const [name,path,body,status] of [
  ["empty bag",quote,{items:[]},400],
  ["duplicate lines",quote,{items:[line,line]},400],
  ["invalid variant identity",quote,{items:[{variantId:"unknown",quantity:1}]},400],
  ["fractional quantity",quote,{items:[{variantId,quantity:.5}]},400],
  ["quantity above demo limit",quote,{items:[{variantId,quantity:9}]},400],
  ["line count above demo limit",quote,{items:Array.from({length:21},()=>({variantId:randomUUID(),quantity:1}))},400],
  ["unknown contact topic",contact,{topic:"Unlisted",sample:true},400],
  ["missing contact acknowledgement",contact,{topic:"Dimensions"},400],
  ["demo order without owner cookie","/api/orders",{},409],
  ["anonymous admin inventory","/api/admin/inventory",{},403],
  ["anonymous admin product creation","/api/admin/products",{},403]
] as const){
  test(name,async({request})=>{
    const response=await request.post(path,{headers:{origin},data:body});
    expect(response.status()).toBe(status);expect(response.headers()["cache-control"]).toContain("no-store");
    expect(await response.json()).toMatchObject({error:{code:expect.any(String),message:expect.any(String)}});
  });
}
for(const path of [quote,contact,"/api/orders","/api/admin/inventory"]){
  test("origin required on "+path,async({request})=>{const r=await request.post(path,{data:{}});expect(r.status()).toBe(403);expect((await r.json()).error.code).toBe("ORIGIN_REJECTED");});
}
test("catalog suggestions have a bounded response size",async({request})=>{
  const r=await request.get("/api/products?view=suggestions");expect(r.ok()).toBe(true);
  expect((await r.json()).items.length).toBeLessThanOrEqual(5);
});
test("malformed JSON gives a recoverable response",async({request})=>{
  const r=await request.post(contact,{headers:{origin,"content-type":"application/json"},data:"{"});expect(r.status()).toBe(400);expect((await r.json()).error.code).toBe("INVALID_INPUT");
});
test("unsupported content type is rejected",async({request})=>{
  const r=await request.post(contact,{headers:{origin,"content-type":"text/plain"},data:"sample"});expect(r.status()).toBe(415);
});
test("oversized contact body respects the configured limit",async({request})=>{
  const r=await request.post(contact,{headers:{origin},data:{text:"a".repeat(16385)}});expect(r.status()).toBe(413);
});
test("unknown variant cannot be quoted as available, even with submitted prices",async({request})=>{
  const r=await request.post(quote,{headers:{origin},data:{items:[{...line,priceCents:1}]}});expect(r.status()).toBe(200);
  expect(await r.json()).toMatchObject({available:false,subtotalCents:0});
  const cookie=r.headers()["set-cookie"];expect(cookie).toMatch(/HttpOnly/i);expect(cookie).toMatch(/SameSite=lax/i);
});
test("ownerless confirmation responses are private",async({request})=>{
  const r=await request.get("/api/orders/VL-"+randomUUID().replaceAll("-",""));expect(r.status()).toBe(404);expect(r.headers()["cache-control"]).toContain("private");
});
test("local preview SEO blocks indexing until an origin is configured",async({request})=>{
  const r=await request.get("/robots.txt");expect(await r.text()).toContain("Disallow: /");
});
test("production document blocks framing and content sniffing",async({request})=>{
  const r=await request.get("/about");expect(r.headers()["x-frame-options"]).toBe("DENY");expect(r.headers()["x-content-type-options"]).toBe("nosniff");expect(r.headers()["content-security-policy"]).toContain("object-src 'none'");expect(r.headers()["content-security-policy"]).not.toContain("unsafe-eval");
});
