// Common abbreviations that shouldn't split sentences
const ABBREVS = /(?:Mr|Mrs|Ms|Dr|Prof|Sr|Jr|vs|etc|e\.g|i\.e|Inc|Ltd|Co|St|Ave|Dept|Est|approx|fig|vol|no)\.\s/gi;

// Split text into sentences (handles abbreviations)
export function splitSentences(text: string): string[] {
  // Protect abbreviations by replacing their periods with a placeholder
  const protected_ = text.replace(ABBREVS, (m) => m.replace(".", "\x00"));
  return protected_
    .replace(/([.?!])\s+/g, "$1|")
    .split("|")
    .map((s) => s.replace(/\x00/g, ".").trim())
    .filter((s) => s.length > 0);
}

// Count words in a string
export function countWords(text: string): number {
  return text.split(/\s+/).filter((w) => w.length > 0).length;
}

// Strip HTML tags and normalise whitespace
export function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// Average words per sentence
export function avgWordsPerSentence(text: string): number {
  const sentences = splitSentences(text);
  if (sentences.length === 0) return 0;
  const total = sentences.reduce((sum, s) => sum + countWords(s), 0);
  return Math.round(total / sentences.length);
}

// Percentage of sentences using passive voice (handles irregular past participles too)
export function passiveVoiceRatio(text: string): number {
  const sentences = splitSentences(text);
  if (sentences.length === 0) return 0;
  const irregulars = "broken|chosen|driven|eaten|fallen|given|grown|hidden|known|risen|spoken|stolen|taken|thrown|written|worn|torn|sworn|shaken|frozen|forgotten|begun|done|gone|seen|been|come|become|run|hung|held|kept|left|lost|made|meant|met|paid|put|read|said|sent|set|shot|shown|shut|sold|spent|stood|told|thought|understood|won";
  const passivePattern = new RegExp(`\\b(is|are|was|were|be|been|being)\\s+(\\w+ed|${irregulars})\\b`, "i");
  const passiveCount = sentences.filter((s) => passivePattern.test(s)).length;
  return passiveCount / sentences.length;
}

// Extract headings from HTML (h1-h6)
export function extractHeadings(html: string): string[] {
  const matches = html.match(/<h[1-6][^>]*>([\s\S]*?)<\/h[1-6]>/gi) || [];
  return matches.map((h) => stripHtml(h));
}

// Count code blocks in HTML
export function countCodeBlocks(html: string): number {
  const matches = html.match(/<pre[\s>]/gi) || [];
  return matches.length;
}

// Count <img> tags in HTML
export function countImages(html: string): number {
  const matches = html.match(/<img[\s>]/gi) || [];
  return matches.length;
}

// Count <a> tags in HTML (external/content links)
export function countLinks(html: string): number {
  const matches = html.match(/<a\s[^>]*href\s*=/gi) || [];
  return matches.length;
}

// Detect clickbait-style titles
export function isClickbait(title: string): boolean {
  const allCaps = title === title.toUpperCase() && title.length > 10;
  const excessivePunctuation = /[!?]{2,}/.test(title);
  const baitPhrases = /\b(you won'?t believe|shocking|insane|mind[- ]?blow|secret|nobody tells)/i.test(title);
  return allCaps || excessivePunctuation || baitPhrases;
}

// Split text into paragraphs by double newlines
export function splitParagraphs(text: string): string[] {
  return text.split(/\n\s*\n/).map((p) => p.trim()).filter((p) => p.length > 0);
}

// Count <p> tags in HTML (more reliable than text-based paragraph splitting)
export function countHtmlParagraphs(html: string): number {
  const matches = html.match(/<p[\s>]/gi) || [];
  return matches.length;
}

// Get paragraph word counts from HTML <p> tags
export function getHtmlParagraphWordCounts(html: string): number[] {
  const pBlocks = html.match(/<p[^>]*>[\s\S]*?<\/p>/gi) || [];
  return pBlocks.map((p) => countWords(stripHtml(p))).filter((c) => c > 0);
}

// Extract heading levels from HTML (returns array like [2, 2, 3, 2, 4])
export function extractHeadingLevels(html: string): number[] {
  const matches = html.match(/<h([1-6])[^>]*>/gi) || [];
  return matches.map((h) => parseInt(h.match(/\d/)![0], 10));
}

// Detect boring/generic opening sentence
export function hasBoringOpener(text: string): boolean {
  const first150 = text.slice(0, 150).toLowerCase();
  return /^(in this (blog|article|post|piece)|this (blog|article|post) (will|is about)|today (i will|we will|i'm going|we're going)|welcome to (my|this|our)|hello,? (readers|everyone|folks))/.test(first150);
}

// Find words that appear too frequently (threshold scales with word count)
export function findRepetitiveWords(text: string): { word: string; count: number }[] {
  const words = text.toLowerCase().match(/\b[a-z]{4,}\b/g) || [];
  const stopWords = new Set(["this", "that", "with", "from", "have", "been", "will", "your", "they", "their", "them", "were", "would", "could", "should", "about", "which", "when", "what", "there", "these", "those", "than", "then", "also", "into", "more", "some", "such", "only", "very", "just", "like", "over", "does", "each", "make", "made"]);
  const freq = new Map<string, number>();
  for (const w of words) {
    if (stopWords.has(w)) continue;
    freq.set(w, (freq.get(w) || 0) + 1);
  }
  // Threshold: 2% of total words, minimum 5 occurrences
  const threshold = Math.max(5, Math.round(words.length * 0.02));
  return [...freq.entries()]
    .filter(([, count]) => count >= threshold)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([word, count]) => ({ word, count }));
}
