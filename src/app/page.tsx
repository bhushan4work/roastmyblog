'use client';

import { useState } from "react";
import Hero from "@/components/Hero";
import Loading from "@/components/Loading";
import Results from "@/components/Results";
import { analyzeUrl, type RoastResponse } from "@/lib/api";

type View = "hero" | "loading" | "results" | "error";

export default function Home() {
  const [view, setView] = useState<View>("hero");
  const [data, setData] = useState<RoastResponse | null>(null);
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (blogUrl: string) => {
    setUrl(blogUrl);
    setView("loading");
    setError("");
    try {
      const result = await analyzeUrl(blogUrl);
      setData(result);
      setView("results");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setView("error");
    }
  };

  const handleReset = () => {
    setView("hero");
    setData(null);
    setUrl("");
    setError("");
  };

  if (view === "loading") return <Loading url={url} />;

  if (view === "results" && data) {
    return <Results data={data} url={url} onRoastAnother={handleReset} />;
  }

  if (view === "error") {
    // If the error is a 403 or scraping-block, show a friendly message in Results layout
    const blockMsg =
      error.includes("403") || /blocked|forbidden|not allowed|denied|cloudflare|scrap/i.test(error)
        ? "Sorry, this blog blocks automated readers (like Medium, Substack, or some Next.js blogs). We can't roast it. Try another blog!"
        : error;
    return (
      <div className="min-h-screen py-16 px-4">
        <div className="max-w-2xl mx-auto">
          <button
            onClick={handleReset}
            className="mb-6 text-brand underline text-sm font-mono hover:text-brand-dark transition-colors"
          >
            ← Go back to landing page
          </button>
          <div className="flex flex-col items-center justify-center py-24">
            <h2 className="text-2xl font-bold text-white mb-3 flex items-center gap-2">
              Roast failed <span className="text-2xl">⚠</span>
            </h2>
            <p className="text-text-dim text-center max-w-md mb-8">{blockMsg}</p>
          </div>
        </div>
      </div>
    );
  }

  return <Hero onSubmit={handleSubmit} />;
}
