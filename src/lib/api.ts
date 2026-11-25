export async function api<T>(url: string, method: "POST" | "PATCH", data: unknown, signal?: AbortSignal): Promise<T> {
  const response = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(data), signal });
  if (!response.ok) {
    const payload = await response.json().catch(() => null);
    throw new Error(payload?.error?.message ?? "The request could not be completed.");
  }
  return response.json();
}
