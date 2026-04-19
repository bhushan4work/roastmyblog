'use client';

import { useState, useEffect } from "react";
import useSWR from "swr";
import { type RecentRoast } from "@/lib/api";

interface Props {
  onSubmit: (url: string) => void;
}

// SWR fetcher function
const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch stats');
  return res.json();
};

// Fixed avatar seeds for the PFP row
const AVATAR_SEEDS = [
  "felix", "bandit", "nala", "milo", "boo", "rocky", "shadow",
  "ginger", "patch", "dusty", "ziggy", "pepper", "mocha", "scout",
];

export default function Hero({ onSubmit }: Props) {
  const [url, setUrl] = useState("");
  
  // SWR: caches stats for 60 seconds, instant refetch on mount if cache fresh
  const { data, isLoading, error } = useSWR(
    '/api/stats',
    fetcher,
    {
      revalidateOnFocus: false, // Don't refetch when tab regains focus
      dedupingInterval: 60000, // Cache for 60 seconds
      focusThrottleInterval: 60000,
    }
  );
  
  const count = data?.count || 0;
  const recent = data?.recent || [];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedUrl = url.trim();
    
    // Validate URL format
    if (!trimmedUrl) {
      alert('Please enter a blog URL');
      return;
    }
    
    // Auto-add protocol if missing
    let urlToSubmit = trimmedUrl;
    if (!trimmedUrl.startsWith('http://') && !trimmedUrl.startsWith('https://')) {
      urlToSubmit = `http://${trimmedUrl}`;
    }
    
    // Basic format validation
    try {
      new URL(urlToSubmit);
    } catch {
      alert('Please enter a valid URL (e.g., example.com or https://example.com)');
      return;
    }
    
    onSubmit(urlToSubmit);
  };

  // Only duplicate for marquee if enough cards to scroll
  const needsMarquee = recent.length >= 4;

  // For the second row, only show if there are at least 8 unique roasts
  const showSecondRow = recent.length >= 8;
  // Split the recent roasts into two non-overlapping groups for the two marquees
  const half = Math.ceil(recent.length / 2);
  const firstRow = needsMarquee ? [...recent.slice(0, half), ...recent.slice(0, half)] : recent.slice(0, half);
  const secondRow = showSecondRow ? (needsMarquee ? [...recent.slice(half), ...recent.slice(half)] : recent.slice(half)) : [];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-1 md:px-0">
      {/* Title */}
      <h1 className="text-4xl md:text-5xl font-bold text-white text-center mb-4 animate-fade-in tracking-tight uppercase"
          style={{ fontFamily: "'Space Grotesk', monospace" }}>
        Roast My Blog
      </h1>

      {/* Subtitle */}
      <p className="text-[#888] text-md md:text-lg text-center max-w-md mb-6 animate-fade-in-delay">
        Drop your URL. We'll read every word of your blog and roast it with no mercy.
      </p>

      {/* Input bar */}
      <form onSubmit={handleSubmit} className="w-full max-w-sm animate-fade-in-delay">
        <div
          className="flex border border-[#de7356] overflow-hidden bg-[#0a0a0a]"
          style={{ boxShadow: '4px 4px 0 #de7356' }}
        >
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="paste-your-blog-here.com"
            className="flex-1 bg-transparent px-3 py-4 text-white placeholder-[#555] focus:outline-none text-xs font-mono"
            required
          />
          <button
            type="submit"
            className="bg-[#de7356] text-white font-semibold px-4 py-2 text-xs uppercase tracking-widest hover:bg-[#E48F77] transition-colors cursor-pointer whitespace-nowrap"
          >
            Roast It
          </button>
        </div>
      </form>

      {/* PFP row + counter with skeleton */}
      <div className="flex items-center gap-2 mt-4 animate-fade-in-delay">
        <div className="flex -space-x-1.5">
          {AVATAR_SEEDS.map((seed) => (
            <img
              key={seed}
              src={`https://api.dicebear.com/9.x/pixel-art/svg?seed=${seed}&size=20`}
              alt=""
              className="w-5 h-5 rounded-full border border-[#0a0a0a] bg-[#1a1a1a]"
            />
          ))}
        </div>
        <span className="text-[#888] text-xs font-mono">
          {isLoading ? (
            <span className="animate-pulse">Loading...</span>
          ) : (
            `${count} blogs roasted`
          )}
        </span>
      </div>

      {/* Recently roasted section */}
      {recent.length > 0 && (
        <div className="w-full mt-16 animate-fade-in-delay">
          <p className="text-[#555] text-xs uppercase tracking-[0.3em] text-center mb-6 font-mono">
            Recently Roasted
          </p>

          {/* Marquee container 1 */}
          <div className="relative overflow-hidden w-full mb-4">
            {/* Fade edges */}
            <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-[#0a0a0a] to-transparent z-10 pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-[#0a0a0a] to-transparent z-10 pointer-events-none" />

            <div className={`flex gap-4 ${needsMarquee ? "marquee-track" : "justify-center"}`}>
              {firstRow.map((r: RecentRoast, i: number) => (
                <div
                  key={`marquee1-${r.url}-${i}`}
                  className="flex-shrink-0 w-80 border border-[#222] rounded-md px-4 py-2 bg-[#111] hover:border-[#de7356] transition-colors shadow-lg"
                >
                  <div className="flex items-center gap-3 mb-1">
                    <img
                      src={`https://api.dicebear.com/9.x/pixel-art/svg?seed=${r.avatar}&size=32`}
                      alt="pfp"
                      className="w-6 h-6 rounded-full border border-[#222] bg-[#222]"
                    />
                    <span className="font-mono text-xs text-[#fff] truncate">{r.url}</span>
                  </div>
                  <p className="text-[#aaa] text-[12px] leading-snug italic truncate">
                    {r.snippet}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Marquee container 2 (reverse direction, only if enough roasts) */}
          {showSecondRow && (
            <div className="relative overflow-hidden w-full">
              {/* Fade edges */}
              <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-[#0a0a0a] to-transparent z-10 pointer-events-none" />
              <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-[#0a0a0a] to-transparent z-10 pointer-events-none" />

              <div className={`flex gap-4 ${needsMarquee ? "marquee-track-reverse" : "justify-center"}`}>
                {secondRow.map((r: RecentRoast, i: number) => (
                  <div
                    key={`marquee2-${r.url}-${i}`}
                    className="flex-shrink-0 w-80 border border-[#222] rounded-md px-4 py-2 bg-[#111] hover:border-[#de7356] transition-colors shadow-lg"
                  >
                    <div className="flex items-center gap-3 mb-1">
                      <img
                        src={`https://api.dicebear.com/9.x/pixel-art/svg?seed=${r.avatar}&size=32`}
                        alt="pfp"
                        className="w-6 h-6 rounded-full border border-[#222] bg-[#222]"
                      />
                      <span className="font-mono text-xs text-[#fff] truncate">{r.url}</span>
                    </div>
                    <p className="text-[#aaa] text-[12px] leading-snug italic truncate">
                      {r.snippet}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
