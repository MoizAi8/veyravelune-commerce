import { beforeAll, afterAll, expect, it } from "vitest";
import { config } from "dotenv";
import { randomUUID } from "node:crypto";
import { createDatabase } from "@/server/db";
import { catalog, catalogQuery } from "@/server/services/catalog";
config({path:[".env.local",".env"],quiet:true});
const url=process.env.TEST_DATABASE_URL;
if(!url || !new URL(url).pathname.endsWith("_test") || url===process.env.DATABASE_URL)throw Error("An isolated test database is required");
const db=createDatabase(url);
const key=randomUUID();
let categoryId:string;
beforeAll(async()=>{
  const group=await db.category.create({data:{slug:key,name:"Orangery",description:"QA",image:"/fixture"}});
  categoryId=group.id;
  for (const [suffix,title,description,active] of [
    ["principal","Calanthe Daybed","Hand carved sunburst detail",true],
    ["companion","Companion Seat","A companion for the Calanthe Daybed",true],
    ["hidden","Unpublished Orchid","Private draft",false],
  ] as const){
    await db.product.create({data:{categoryId,slug:key+suffix,title,description,active,dimensions:"QA",material:"Rosewood",variants:{create:[
      {sku:key+suffix,finish:"Celadon",priceCents:61300,stock:2},
      {sku:key+suffix+"retired",finish:"Discontinued Lilac",priceCents:1,stock:1,active:false}
    ]}}});
  }
});
afterAll(async()=>{
  if(categoryId)await db.$transaction(async tx=>{
    await tx.variant.deleteMany({where:{product:{categoryId}}});await tx.product.deleteMany({where:{categoryId}});await tx.category.delete({where:{id:categoryId}});
  });
  await db.$disconnect();
});
it.each([
 ["full name","Calanthe Daybed"],["partial name","calan"],["case folding","cALantHE"],["description","sunburst"],
 ["name across fields","calanthe rosewood"],["category","Orangery"],["collection","orangery collection"],["material","rosewood"],
 ["finish","celadon"],["missing letter","calathe"],["transposition","calatnhe"],["extra letter","calannthe"],
 ["substitution","calantxe"],["diacritic folding","calanthé"]
])("matches the active database fixture by %s",async(_,q)=>{
  const results=await catalog(db,catalogQuery.parse({q}));
  const item=results.items.find(row=>row.slug===key+"principal");
  expect(item?.variants.map(v=>[v.finish,v.priceCents])).toEqual([["Celadon",61300]]);
});
it.each(["unpublished orchid","discontinued lilac","xylophonist","***","%_","celadon xylophonist"])("returns no public fixture for %s",async(q)=>{
  const page=await catalog(db,catalogQuery.parse({q}));expect(page.items.filter(row=>row.categoryId===categoryId)).toHaveLength(0);
});
it("ranks exact title before a description-only match",async()=>{
  const page=await catalog(db,catalogQuery.parse({q:"Calanthe Daybed"}));expect(page.items[0].slug).toBe(key+"principal");
});
it("retains price bounds and rejects overlong input",async()=>{
  expect(catalogQuery.safeParse({q:"x".repeat(81)}).success).toBe(false);
  expect((await catalog(db,catalogQuery.parse({q:"calanthe",max:"1"}))).total).toBe(0);
});
