import { z } from "zod";
import { guestOwner } from "@/server/auth/guest";
import { jsonInput, privateHeaders, rateLimit, requireOrigin, route } from "@/server/request";
const input = z.object({ topic: z.enum(["Materials", "Dimensions", "Demo orders"]), sample: z.literal(true) });
export async function POST(request: Request) {
  return route(async () => {
    requireOrigin(request);
    await jsonInput(request, input);
    await rateLimit("contact-global", "all", 120, 600);
    const owner = await guestOwner(true);
    if (owner) await rateLimit("contact", owner, 5, 600);
    return Response.json({ message: "Your sample inquiry passed validation. No message was sent or stored." }, { headers: privateHeaders });
  });
}
