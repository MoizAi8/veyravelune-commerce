import Link from "next/link";
import { redirect } from "next/navigation";
import { AdminLogin } from "@/components/admin/session";
import { adminUser } from "@/server/auth/admin";
export const dynamic = "force-dynamic";
export const metadata = { title: "Atelier sign-in", robots: { index: false } };
export default async function SignIn() {
  if (await adminUser()) redirect("/admin");
  return <main className="shell admin-shell"><Link className="text-link" href="/">Return to storefront</Link><h1>Atelier sign-in</h1><AdminLogin /></main>;
}
