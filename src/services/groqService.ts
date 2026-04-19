import Groq from "groq-sdk";
import { ScrapedData, Issue, GeminiResponse } from "../types";

function getClient() {
  const key = process.env.GROQ_API_KEY;
  if (!key) throw new Error("GROQ_API_KEY is not set in environment.");
  return new Groq({ apiKey: key });
}

function validateRoastResponse(response: unknown, issueCount: number): response is GeminiResponse {
  if (!response || typeof response !== 'object') return false;
  
  const obj = response as Record<string, unknown>;
  
  // Validate roast is non-empty string with minimum content
  if (typeof obj.roast !== 'string' || obj.roast.trim().length < 50) {
    return false;
  }
  
  // Validate improvements is an array
  if (!Array.isArray(obj.improvements)) return false;
  
  // Validate improvements length matches issues count
  const expectedLength = issueCount > 0 ? issueCount : 3;
  const tolerance = 1; // Allow ±1 improvement
  if (obj.improvements.length < expectedLength - tolerance || obj.improvements.length > expectedLength + tolerance) {
    return false;
  }
  
  // Validate each improvement is a non-empty string
  if (!obj.improvements.every(imp => typeof imp === 'string' && imp.trim().length > 10)) {
    return false;
  }
  
  return true;
}

export async function generateRoast(
    data: ScrapedData,
    issues: Issue[],
): Promise<GeminiResponse> {
    const issueCount = issues.length;
    const issueList = issues.map((i) => `- [${i.severity.toUpperCase()}] ${i.message}`).join("\n");
    
    // Calculate expected improvements count
    const expectedImprovements = issueCount > 0 ? issueCount : 3;

    // Send a meaningful content sample (first ~800 chars + last ~400 chars for opener/closer context)
    const contentSample = data.text.length > 1200
      ? data.text.slice(0, 800) + "\n[...]\n" + data.text.slice(-400)
      : data.text;

    const stats = [
      `Word count: ${data.wordCount}`,
      `Images: ${(data.html.match(/<img[\s>]/gi) || []).length}`,
      `Links: ${(data.html.match(/<a\s[^>]*href/gi) || []).length}`,
      `Headings: ${(data.html.match(/<h[1-6][^>]*>/gi) || []).length}`,
      `Paragraphs: ${(data.html.match(/<p[\s>]/gi) || []).length}`,
    ].join(" | ");

    const prompt = `You are the most brutally honest, savage blog critic on the internet. You roast blog posts with no mercy — sarcastic, witty, and painfully accurate. Think standup comedian meets literary critic.

Blog title: "${data.title}"
${stats}
Excerpt: "${data.excerpt || "(none — they couldn't even write a meta description)"}"

Content sample:
"""${contentSample}"""

Structural & readability checks found (${issueCount} issue${issueCount === 1 ? '' : 's'}):
${issueList || "No issues found (rare — roast them for being suspiciously clean)."}

Respond in this EXACT JSON format, nothing else:
{
  "roast": "YOUR ROAST HERE",
  "improvements": [${Array.from({length: expectedImprovements}).map((_, i) => `"improvement ${i + 1}"`).join(', ')}]
}

Rules for the roast:
- Write 5-8 paragraphs, each a standalone burn separated by \\n\\n
- You MUST weave in EVERY structural & readability issue listed above — roast them specifically
- Be savage but witty, not just rude — make it genuinely funny
- Quote or reference SPECIFIC phrases, sentences, or claims from the content sample
- Roast the writing style, logic, structure, and pretentiousness

Rules for improvements:
- Return EXACTLY ${expectedImprovements} improvement${expectedImprovements === 1 ? '' : 's'}
- Each improvement: one sentence, direct, specific to THIS blog, actionable
- For EVERY issue listed, provide one improvement to fix it
${issueCount === 0 ? '- Since there are no issues, provide 3 general improvement tips for any blog.' : ''}
- Return ONLY valid JSON, no markdown`;

    try {
        const client = getClient();
        const result = await client.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            messages: [{ role: "user", content: prompt }],
            temperature: 0.7,
            response_format: { type: "json_object" },
        });

        const text = result.choices[0]?.message?.content?.trim() || "";
        let parsed;
        try {
          parsed = JSON.parse(text);
        } catch {
          throw new Error('AI returned invalid JSON');
        }
        
        // Validate response structure
        if (!validateRoastResponse(parsed, issueCount)) {
          console.error('Invalid roast response structure:', { parsed, issueCount });
          throw new Error('AI response validation failed - invalid structure or length');
        }
        
        return parsed;
    } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        console.error('Groq service error:', msg);
        
        // Fallback: create a structured response that maintains quality expectations
        const fallbackImprovements = Array.from({length: Math.max(issueCount, 2)}, (_, i) => 
          `Review and refine section ${i + 1} for clarity and engagement.`
        );
        
        return {
            roast: `Our AI roaster had a technical hiccup analyzing this blog, but based on the ${issueCount} structural and readability issue${issueCount === 1 ? '' : 's'} we found, this needs serious work. The content structure is questionable, the writing could be sharper, and overall it reads like a first draft that never got a second look. Come back soon and we'll give you the full savage breakdown it deserves.`,
            improvements: fallbackImprovements,
        };
    }
}
