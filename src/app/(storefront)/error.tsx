"use client";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return <section className="shell page-space" role="alert"><h1>The atelier is temporarily unavailable.</h1><p>Please try again shortly.</p><button className="button" onClick={reset}>Try again</button></section>;
}
