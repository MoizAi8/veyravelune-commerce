import { NextResponse } from "next/server";
import { db } from "@/server/database";
import { rateLimit, route } from "@/server/request";
import { catalog, catalogQuery } from "@/server/services/catalog";
import { Failure } from "@/server/services/failure";
export async function GET(request: Request) {
  return route(async () => {
    const input = catalogQuery.safeParse(Object.fromEntries(new URL(request.url).searchParams));
    if (!input.success) throw new Failure(400, "INVALID_FILTER", "Check your catalog filters.");
    if(input.data.q) await rateLimit("catalog-query","all",900,60);
    const page = await catalog(db(), input.data);
    if (new URL(request.url).searchParams.get("view") === "suggestions") {
      return NextResponse.json({total:page.total, items:page.items.slice(0,5).map(item=>({
        slug:item.slug,title:item.title,image:item.images[0]?.path ?? null,category:item.category.name,
        material:item.material,priceCents:item.variants[0].priceCents,multiplePrices:item.variants.some(v=>v.priceCents!==item.variants[0].priceCents),
        finish:[...new Set(item.variants.map(v=>v.finish))].join(" / ")
      }))});
    }
    return NextResponse.json(page);
  });
}
