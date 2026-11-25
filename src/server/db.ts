import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

export function createDatabase(connectionString: string) {
  return new PrismaClient({ adapter: new PrismaPg({ connectionString, connectionTimeoutMillis: 3500, max: 5 }) });
}

const cache = globalThis as typeof globalThis & { veyraveluneDb?: PrismaClient };
export function db() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error("Database configuration is missing");
  return cache.veyraveluneDb ??= createDatabase(connectionString);
}
