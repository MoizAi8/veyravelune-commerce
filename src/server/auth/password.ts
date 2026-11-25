import { randomBytes, scrypt, timingSafeEqual } from "node:crypto";
function derive(password: string, salt: string) {
  return new Promise<Buffer>((resolve, reject) => {
    scrypt(password, salt, 64, { N: 32768, r: 8, p: 3, maxmem: 64 * 1024 * 1024 }, (error, key) => {
      if (error) reject(error);
      else resolve(key);
    });
  });
}
export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  return salt + ":" + (await derive(password, salt)).toString("hex");
}

export async function verifyPassword(password: string, stored?: string) {
  const [salt = "0".repeat(32), expected = "0".repeat(128)] = (stored ?? "").split(":");
  const baseline = Buffer.from(expected, "hex");
  const actual = await derive(password, salt);
  return baseline.length === actual.length && timingSafeEqual(actual, baseline) && Boolean(stored);
}
