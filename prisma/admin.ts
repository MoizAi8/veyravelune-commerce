import { config } from "dotenv";
import { z } from "zod";
import { createDatabase } from "../src/server/db";
import { hashPassword } from "../src/server/auth/password";
config({ path: [".env.local", ".env"], quiet: true });

const parsed = z.object({ DATABASE_URL: z.string().min(1), DEMO_ADMIN_EMAIL: z.email(),
  DEMO_ADMIN_PASSWORD: z.string().min(16).max(128) }).safeParse(process.env);
if (!parsed.success) throw new Error("Set DATABASE_URL, DEMO_ADMIN_EMAIL and a private DEMO_ADMIN_PASSWORD of 16–128 characters.");
const { DATABASE_URL, DEMO_ADMIN_EMAIL, DEMO_ADMIN_PASSWORD } = parsed.data;
const prisma = createDatabase(DATABASE_URL);

async function provision() {
  const email = DEMO_ADMIN_EMAIL.trim().toLowerCase();
  const passwordHash = await hashPassword(DEMO_ADMIN_PASSWORD);
  await prisma.user.upsert({ where: { email }, create: { email, passwordHash, role: "ADMIN" },
    update: { passwordHash, role: "ADMIN" } });
  console.log("Private administrator provisioned.");
}
provision().finally(() => prisma.$disconnect());
