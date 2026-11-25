"use client";
import { useState, type FormEvent } from "react";
import { signIn, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

export function AdminLogin() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const fields = new FormData(event.currentTarget);
    setBusy(true); setError("");
    try {
      const result = await signIn("credentials", { email: fields.get("email"), password: fields.get("password"), redirect: false, callbackUrl: "/admin" });
      if (!result?.ok || result.error) throw new Error();
      router.replace("/admin");
      router.refresh();
    } catch { setError("Unable to sign in. Check your credentials and try again."); setBusy(false); }
  }
  return <form className="form-stack admin-sign-in" onSubmit={submit}>
    <label>Email<input name="email" type="email" autoComplete="username" required maxLength={254} /></label>
    <label>Password<input name="password" type="password" autoComplete="current-password" required maxLength={128} /></label>
    {error && <p role="alert">{error}</p>}
    <button className="button" disabled={busy}>{busy ? "Signing in…" : "Sign in"}</button>
  </form>;
}
export function Logout() {
  return <button type="button" className="text-link" onClick={() => void signOut({ callbackUrl: "/admin/sign-in" })}>Sign out</button>;
}
