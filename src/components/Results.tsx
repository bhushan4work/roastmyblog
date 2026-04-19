'use client';

import type { RoastResponse } from "@/lib/api";

interface Props {
  data: RoastResponse;
  url: string;
  onRoastAnother: () => void;
}

import { useState } from "react";

export default function Results({ data, url, onRoastAnother }: Props) {
  const [showAll, setShowAll] = useState(false);
  const paragraphs = data.roast.split("\n\n").filter((p) => p.trim());

  // Get favicon from the blog's domain
  let favicon = "";
  try {
    const domain = new URL(url).hostname;
    favicon = `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;
  } catch {}

  const improvementsToShow = showAll ? data.improvements : data.improvements.slice(0, 3);

  return (
    <div className="min-h-screen py-8 px-1 md:px-0">
      <div className="max-w-md mx-auto">

        {/* Go back button */}
        <button
          onClick={onRoastAnother}
          className="mb-12 text-[#de7356] text-brand underline text-xs font-mono hover:text-brand-dark transition-colors"
        >
          ← Go back to landing page
        </button>

        {/* Blog title bar */}
        <div className="flex items-center gap-2 mb-2 animate-fade-in">
          {favicon && (
            <img src={favicon} alt="" className="w-4 h-4 rounded" />
          )}
          <h2 className="text-neutral-500 text-xs underline font-mono uppercase tracking-wider truncate">
            {data.title}
          </h2>
        </div>

        {/* Divider */}
        <div className="h-px bg-brand mb-2 animate-fade-in" />

        {/* Roast */}
        <div className="mb-12">
          {paragraphs.map((p, i) => (
            <p
              key={i}
              className="text-white/90 text-base leading-relaxed roast-paragraph"
              style={{ animationDelay: `${i * 0.15}s`, marginBottom: i < paragraphs.length - 1 ? "1rem" : 0 }}
            >
              {p}
            </p>
          ))}
        </div>

        {/* Improvements */}
        {data.improvements.length > 0 && (
          <div className="mb-16 animate-fade-in-delay">
            <h2 className="text-xl text-neutral-500 font-semibold mb-2 flex items-center gap-2">
              <span>🛠️</span> <span className="underline">How to actually fix this</span>
            </h2>
            <div className="space-y-3">
              {improvementsToShow.map((imp, i) => (
                <div
                  key={i}
                  className="bg-surface-light p-2 flex gap-3 items-start"
                >
                  <span className="text-brand font-bold text-sm mt-0.5">{i + 1}.</span>
                  <p className="text-text text-sm leading-relaxed">{imp}</p>
                </div>
              ))}
            </div>
            {data.improvements.length > 3 && !showAll && (
              <button
                className="mt-3 text-[#de7356] text-brand underline text-xs font-mono hover:text-brand-dark transition-colors"
                onClick={() => setShowAll(true)}
              >
                Show more fixes
              </button>
            )}
            {showAll && data.improvements.length > 3 && (
              <button
                className="mt-3 text-[#de7356] text-brand underline text-xs font-mono hover:text-brand-dark transition-colors"
                onClick={() => setShowAll(false)}
              >
                Show less
              </button>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
