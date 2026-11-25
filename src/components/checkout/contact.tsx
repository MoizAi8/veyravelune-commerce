"use client";
import { useState, type FormEvent } from "react";
import { api } from "@/lib/api";
export function ContactForm() {
  const [result, setResult] = useState<{ message: string; error: boolean }>();
  const [busy, setBusy] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setBusy(true);
    setResult(undefined);
    try {
      const response = await api<{ message: string }>("/api/contact", "POST", { topic: form.get("topic"), sample: form.get("sample") === "on" });
      setResult({ message: response.message, error: false });
    } catch (error) {
      setResult({ message: error instanceof Error ? error.message : "Please try again.", error: true });
    } finally { setBusy(false); }
  }
  return <form className="form-stack sample-form" onSubmit={submit}>
    <label>Inquiry topic<select name="topic"><option>Materials</option><option>Dimensions</option><option>Demo orders</option></select></label>
    <label className="check"><input required type="checkbox" name="sample" /> I’m submitting a sample inquiry.</label>
    <button className="button" disabled={busy}>{busy ? "Validating…" : "Validate sample inquiry"}</button>
    {result && <p role={result.error ? "alert" : "status"}>{result.message}</p>}
  </form>;
}
