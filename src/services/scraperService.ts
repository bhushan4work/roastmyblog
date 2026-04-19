import axios, { AxiosError } from "axios";
import { JSDOM } from "jsdom";
import { Readability } from "@mozilla/readability";
import { ScrapedData } from "../types";
import { countWords } from "../utils/textUtil";

// Fetch a blog URL → extract clean article content via Readability
export async function scrapeBlog(url: string): Promise<ScrapedData> {
  try {
    const response = await axios.get<string>(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
      },
      timeout: 10000,
      maxContentLength: 5 * 1024 * 1024, // 5MB max
    });

    // Validate content type
    const contentType = response.headers['content-type']?.toLowerCase() || '';
    if (!contentType.includes('text/html')) {
      throw new Error('URL does not return HTML content. Please provide a valid blog URL.');
    }

    const rawHtml = response.data;
    const dom = new JSDOM(rawHtml, { url });
    const article = new Readability(dom.window.document).parse();

    if (!article || !article.textContent) {
      throw new Error('No article content found. The page might be behind a paywall, require login, or have no readable content.');
    }

    const text = article.textContent.replace(/\s+/g, " ").trim();
    
    // Validate we got meaningful content
    if (text.length < 100) {
      throw new Error('Article is too short to analyze. Please provide a longer blog post.');
    }

    return {
      title: article.title ?? "Untitled",
      text,
      html: article.content ?? "",
      excerpt: article.excerpt ?? "",
      wordCount: countWords(text),
    };
  } catch (err: unknown) {
    // Check if it's an AxiosError with specific HTTP status
    if (axios.isAxiosError(err)) {
      const status = err.response?.status;
      switch (status) {
        case 404:
          throw new Error('Page not found (404). Please check the URL.');
        case 403:
          throw new Error('Access denied (403). This blog blocks automated reading.');
        case 429:
          throw new Error('Too many requests from our IP. The blog rate-limited us. Try again later.');
        case 401:
          throw new Error('Authentication required. Please provide a public blog URL.');
      }
      
      // Check for connection/timeout errors
      if (err.code === 'ECONNREFUSED') {
        throw new Error('Could not connect to that URL. Check if the domain is correct.');
      } else if (err.code === 'ETIMEDOUT' || err.message?.includes('timeout')) {
        throw new Error('The blog took too long to load (timeout). It might be very slow or large.');
      }
    }
    
    // Re-throw if it's already one of our custom errors
    if (err instanceof Error) {
      throw err;
    }
    
    throw new Error('Failed to fetch and parse the blog. Please check the URL and try again.');
  }
}
