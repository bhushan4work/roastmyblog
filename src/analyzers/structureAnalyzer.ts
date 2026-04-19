import { ScrapedData, Issue } from "../types";
import { extractHeadings, countImages, countLinks, isClickbait, extractHeadingLevels, hasBoringOpener } from "../utils/textUtil";

export function analyzeStructure(data: ScrapedData): Issue[] {
  const issues: Issue[] = [];
  const headings = extractHeadings(data.html);
  const headingLevels = extractHeadingLevels(data.html);

  // No headings at all
  if (headings.length === 0) {
    issues.push({
      id: "no-headings",
      category: "structure",
      severity: "high",
      message: "No headings found. Use h2/h3 to break your post into sections.",
    });
  }

  // Too few headings for a long post (only if some headings exist)
  if (data.wordCount > 500 && headings.length > 0 && headings.length < 2) {
    issues.push({
      id: "few-headings",
      category: "structure",
      severity: "medium",
      message: "Long post with barely any headings. Readers will lose their place.",
    });
  }

  // Extremely short
  if (data.wordCount < 50) {
    issues.push({
      id: "too-short",
      category: "structure",
      severity: "high",
      message: "Post is extremely short. Add more substance.",
    });
  } else if (data.wordCount < 300) {
    // Thin content
    issues.push({
      id: "thin-content",
      category: "structure",
      severity: "medium",
      message: `Only ${data.wordCount} words. Most posts need at least 300-500 words to say anything meaningful.`,
    });
  }

  // No images in a long post
  if (data.wordCount > 400 && countImages(data.html) === 0) {
    issues.push({
      id: "no-images",
      category: "structure",
      severity: "medium",
      message: "No images found. A wall of text with zero visuals is rough on readers.",
    });
  }

  // No outbound links
  if (data.wordCount > 300 && countLinks(data.html) === 0) {
    issues.push({
      id: "no-links",
      category: "structure",
      severity: "low",
      message: "No links found. Cite your sources or link to related content.",
    });
  }

  // Clickbait title
  if (isClickbait(data.title)) {
    issues.push({
      id: "clickbait-title",
      category: "structure",
      severity: "medium",
      message: "Title looks like clickbait. Dial back the ALL CAPS and excessive punctuation.",
    });
  }

  // Title too short or too long
  if (data.title.length > 0 && data.title.length < 10) {
    issues.push({
      id: "title-too-short",
      category: "structure",
      severity: "low",
      message: "Title is very short. A good title gives readers a reason to click.",
    });
  } else if (data.title.length > 100) {
    issues.push({
      id: "title-too-long",
      category: "structure",
      severity: "low",
      message: "Title is over 100 characters. Keep it concise — search engines truncate after ~60.",
    });
  }

  // No excerpt / meta description
  if (!data.excerpt || data.excerpt.trim().length < 10) {
    issues.push({
      id: "no-excerpt",
      category: "structure",
      severity: "low",
      message: "No meta description or excerpt found. This hurts SEO and social sharing.",
    });
  }

  // Heading hierarchy — skipping levels (e.g., h2 → h4)
  for (let i = 1; i < headingLevels.length; i++) {
    if (headingLevels[i] > headingLevels[i - 1] + 1) {
      issues.push({
        id: "skipped-heading-level",
        category: "structure",
        severity: "low",
        message: `Heading levels jump from h${headingLevels[i - 1]} to h${headingLevels[i]}. Don't skip levels — it breaks document outline and accessibility.`,
      });
      break; // only flag once
    }
  }

  // Boring opener
  if (data.wordCount > 100 && hasBoringOpener(data.text)) {
    issues.push({
      id: "boring-opener",
      category: "structure",
      severity: "medium",
      message: "Opens with \"In this blog post...\" or similar. Hook the reader, don't bore them in sentence one.",
    });
  }

  return issues;
}
