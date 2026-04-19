import { NextRequest, NextResponse } from 'next/server';
import { scrapeBlog } from '@/services/scraperService';
import { runAnalysis } from '@/services/analyzerService';
import { generateRoast } from '@/services/groqService';
import { saveRoast, getRoastCount, getRecentRoasts } from '@/services/roastDbService';
import { AnalyzeResponse, RecentRoast } from '@/types';

// Rate limiting map: IP -> array of timestamps
const rateLimitMap = new Map<string, number[]>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const oneMinuteAgo = now - 60000;
  
  if (!rateLimitMap.has(ip)) {
    rateLimitMap.set(ip, [now]);
    return true;
  }
  
  const timestamps = rateLimitMap.get(ip)!.filter(t => t > oneMinuteAgo);
  
  if (timestamps.length >= 5) {
    return false; // Rate limited: max 5 requests per minute
  }
  
  timestamps.push(now);
  rateLimitMap.set(ip, timestamps);
  return true;
}

export async function POST(request: NextRequest) {
  // Check rate limit
  const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
  if (!checkRateLimit(ip)) {
    return NextResponse.json(
      { error: "Too many requests. Please wait a minute before trying again." },
      { status: 429 }
    );
  }

  const { url } = await request.json();

  if (!url || typeof url !== "string") {
    return NextResponse.json({ error: "A valid blog URL is required." }, { status: 400 });
  }

  // Enhanced URL validation
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return NextResponse.json({ error: "Invalid URL format. Please provide a valid blog URL." }, { status: 400 });
  }

  // Validate protocol
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    return NextResponse.json({ error: "Only http/https URLs are allowed." }, { status: 400 });
  }
  
  // Reject localhost and private IPs
  const hostname = parsed.hostname.toLowerCase();
  if (
    hostname === 'localhost' ||
    hostname.startsWith('127.') ||
    hostname.startsWith('192.168.') ||
    hostname.startsWith('10.') ||
    hostname.startsWith('172.') ||
    hostname === '0.0.0.0' ||
    hostname === '::1'
  ) {
    return NextResponse.json({ error: "Cannot roast local/private URLs. Use a public blog." }, { status: 400 });
  }
  
  // Validate URL length
  if (url.length > 2048) {
    return NextResponse.json({ error: "URL is too long." }, { status: 400 });
  }

  try {
    // 1. Scrape the blog
    const data = await scrapeBlog(url);

    // 2. Run local analyzers → issues
    const { issues } = runAnalysis(data);

    // 3. Get AI roast + improvements from Groq
    const ai = await generateRoast(data, issues);

    // 4. Save roast to MongoDB
    await saveRoast({
      url,
      title: data.title,
      roast: ai.roast,
      createdAt: Date.now(),
    });

    // 5. Get updated count and recent roasts
    const [count, recent] = await Promise.all([
      getRoastCount(),
      getRecentRoasts(10),
    ]);

    // 6. Build final response (add count/recent for UI)
    const response: AnalyzeResponse & { count: number; recent: RecentRoast[] } = {
      title: data.title,
      roast: ai.roast,
      improvements: ai.improvements,
      count,
      recent,
    };

    return NextResponse.json(response);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Something went wrong.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
