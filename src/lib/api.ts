export interface RoastResponse {
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

export async function analyzeUrl(url: string): Promise<RoastResponse> {
  // Validate URL before sending
  try {
    new URL(url);
  } catch {
    throw new Error('Invalid URL format. Please provide a valid blog URL.');
  }
  
  // Use AbortController for timeout
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 60000); // 60 second timeout
  
  try {
    const res = await fetch(`/api/analyze`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url }),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!res.ok) {
      let errorMessage = `Server error (${res.status})`;
      try {
        const err = await res.json();
        errorMessage = err.error || errorMessage;
      } catch {
        // Couldn't parse error response, use status code message
      }
      throw new Error(errorMessage);
    }

    // Validate response structure
    const data = await res.json();
    if (!data.roast || !Array.isArray(data.improvements) || !data.title) {
      throw new Error('Invalid response from server. The roast might be incomplete.');
    }
    
    return data as RoastResponse;
  } catch (error) {
    clearTimeout(timeout);
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        throw new Error('Request timed out after 60 seconds. The blog might be too large or slow to load.');
      }
      // Re-throw validation errors
      throw error;
    }
    throw new Error('An unexpected error occurred. Please try again.');
  }
}

export async function fetchStats(): Promise<StatsResponse> {
  try {
    const res = await fetch(`/api/stats`);
    if (!res.ok) {
      console.warn(`Stats API returned ${res.status}`);
      return { count: 0, recent: [] };
    }
    return res.json();
  } catch (error) {
    console.error('Failed to fetch stats:', error);
    return { count: 0, recent: [] };
  }
}
