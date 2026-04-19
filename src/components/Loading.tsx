'use client';

export default function Loading({ url }: { url: string }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-3">
      <div className="flex flex-col items-center justify-center mb-8">
        <div className="animate-spin w-8 h-8 border-4 border-gray-200 border-t-gray-700 rounded-full mb-4" />
      </div>
      <h2 className="text-base font-bold text-white mb-2 text-center" style={{ fontFamily: "'Space Grotesk', monospace" }}>
        Pulling up <span className="font-mono">{url}</span>...
      </h2>
      <p className="text-text-dim text-center max-w-md mb-2">
        Reading every word. This won't be pretty.
      </p>
      <div className="mt-8 flex gap-1.5">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="w-3 h-3 rounded-full bg-brand"
            style={{
              animation: "pulse-glow 1.4s ease-in-out infinite",
              animationDelay: `${i * 0.2}s`,
            }}
          />
        ))}
      </div>
    </div>
  );
}
