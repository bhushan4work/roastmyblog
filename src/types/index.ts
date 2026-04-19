// -- What the client sends --
export interface AnalyzeRequest {
  url: string;
}

// -- What the scraper returns after fetching + parsing a blog --
export interface ScrapedData {
  title: string;
  text: string;       // clean article text (from Readability)
  html: string;       // raw article HTML (for cheerio to find <pre>, <h2>, etc.)
  excerpt: string;    // short extract from the article
  wordCount: number;
}

// -- Fixed sets: only these values are allowed --
export type Severity = "high" | "medium" | "low";
export type Category = "structure" | "readability";

// --  problem found by an analyzer --
export interface Issue {
  id: string;          // e.g. "no-conclusion", "long-sentences"
  category: Category;
  severity: Severity;
  message: string;     // human-readable description of the problem
}

// -- What the analyzer service returns (all issues merged) --
export interface AnalysisResult {
  issues: Issue[];
}

// -- What Groq returns --
export interface GeminiResponse {
  roast: string;
  improvements: string[];
}

// -- Final API response sent to the client --
export interface AnalyzeResponse {
  title: string;
  roast: string;
  improvements: string[];
}

export interface RecentRoast {
  url: string;
  snippet: string;
  avatar: string;
  timestamp: number;
}

export interface StatsResponse {
  count: number;
  recent: RecentRoast[];
}
