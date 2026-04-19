import { ScrapedData, Issue } from "../types";
import { avgWordsPerSentence, passiveVoiceRatio, countWords, findRepetitiveWords, getHtmlParagraphWordCounts, countHtmlParagraphs } from "../utils/textUtil";

export function analyzeReadability(data: ScrapedData): Issue[] {
  const issues: Issue[] = [];
  const avg = avgWordsPerSentence(data.text);
  const passive = passiveVoiceRatio(data.text);
  const paraWordCounts = getHtmlParagraphWordCounts(data.html);
  const paraCount = countHtmlParagraphs(data.html);

  // Sentences too long on average
  if (avg > 25) {
    issues.push({
      id: "long-sentences",
      category: "readability",
      severity: "high",
      message: `Average sentence length is ${avg} words. Keep it under 20 for readability.`,
    });
  } else if (avg > 20) {
    issues.push({
      id: "slightly-long-sentences",
      category: "readability",
      severity: "low",
      message: `Average sentence length is ${avg} words. Could be shorter.`,
    });
  }

  // Too much passive voice
  if (passive > 0.3) {
    issues.push({
      id: "passive-voice",
      category: "readability",
      severity: "medium",
      message: `${Math.round(passive * 100)}% of sentences use passive voice. Use active voice more.`,
    });
  }

  // Wall of text — check HTML paragraph lengths
  const longParas = paraWordCounts.filter((wc) => wc > 150);
  if (longParas.length > 0) {
    issues.push({
      id: "wall-of-text",
      category: "readability",
      severity: "medium",
      message: `${longParas.length} paragraph(s) over 150 words. Break them into smaller chunks.`,
    });
  }

  // Too few paragraph breaks overall
  if (data.wordCount > 500 && paraCount < 3) {
    issues.push({
      id: "few-paragraphs",
      category: "readability",
      severity: "medium",
      message: "500+ words crammed into barely any paragraphs. Hit enter once in a while.",
    });
  }

  // Choppy writing — too many very short paragraphs
  if (paraWordCounts.length >= 5) {
    const shortParas = paraWordCounts.filter((wc) => wc < 15);
    if (shortParas.length / paraWordCounts.length > 0.6) {
      issues.push({
        id: "choppy-writing",
        category: "readability",
        severity: "low",
        message: "Most paragraphs are just 1-2 sentences. Connect your ideas into fuller paragraphs.",
      });
    }
  }

  // Repetitive words
  const repetitive = findRepetitiveWords(data.text);
  if (repetitive.length > 0) {
    const examples = repetitive.map((r) => `"${r.word}" (${r.count}x)`).join(", ");
    issues.push({
      id: "repetitive-words",
      category: "readability",
      severity: "low",
      message: `Overused words: ${examples}. Vary your vocabulary.`,
    });
  }

  return issues;
}
