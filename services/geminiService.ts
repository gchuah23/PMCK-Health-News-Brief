import { GoogleGenAI, Modality } from "@google/genai";
import type { NewsArticle } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable is not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const generateCartoonIllustration = async (prompt: string): Promise<string> => {
  const MAX_RETRIES = 2; // Initial attempt + 2 retries
  let delay = 1000; // Start with 1 second delay

  for (let i = 0; i <= MAX_RETRIES; i++) {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { parts: [{ text: `A simple, flat, 2D vector cartoon illustration representing: "${prompt}"` }] },
        config: {
          responseModalities: [Modality.IMAGE],
        },
      });

      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          const base64ImageBytes: string = part.inlineData.data;
          return `data:image/png;base64,${base64ImageBytes}`;
        }
      }
      return 'https://via.placeholder.com/400x300.png?text=Image+Not+Found';
    } catch (error: any) {
      const isRateLimitError = error.toString().includes('429') || error.toString().includes('RESOURCE_EXHAUSTED');
      
      if (isRateLimitError && i < MAX_RETRIES) {
        console.warn(`Image generation rate limit hit. Retrying in ${delay / 1000}s... (Attempt ${i + 2}/${MAX_RETRIES + 1})`);
        await sleep(delay);
        delay *= 2; // Exponential backoff
      } else {
        console.error('Image generation failed:', error);
        if (isRateLimitError) {
          return 'https://via.placeholder.com/400x300.png?text=API+Quota+Exceeded';
        }
        return 'https://via.placeholder.com/400x300.png?text=Image+Error';
      }
    }
  }

  // This fallback is returned if all retries fail.
  return 'https://via.placeholder.com/400x300.png?text=API+Quota+Exceeded';
};


// FIX: Add `category` to the function signature to make it available when constructing the article object.
export const fetchNews = async (query: string, year: number, month: string, category: string, exclusionQuery?: string): Promise<NewsArticle[]> => {
  try {
    const dateFilter = month === 'All Months' 
      ? `published during the year ${year}` 
      : `published during ${month} ${year}`;

    const prompt = `Find up to 5 of the most important breaking news articles related to "${query}" ${dateFilter}. ${exclusionQuery ? `${exclusionQuery}.` : ''}For each distinct news article, provide its publication date, a short, professional title, a one-sentence blurb, a key takeaway, and five summary bullet points. Format each article as follows, and separate them with '---':
DATE: [Month Day, Year]
TITLE: [The Title]
BLURB: [The Blurb]
TAKEAWAY: [The Key Takeaway]
BULLETS:
* [Bullet Point 1]
* [Bullet Point 2]
* [Bullet Point 3]
* [Bullet Point 4]
* [Bullet Point 5]`;

    const response = await ai.models.generateContent({
       model: "gemini-2.5-flash",
       contents: prompt,
       config: {
         tools: [{googleSearch: {}}],
       },
    });

    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const text = response.text;

    if (!text || !groundingChunks) {
        return [];
    }

    const articlesWithoutImages: Omit<NewsArticle, 'imageUrl'>[] = [];
    const textArticles = text.split('---').filter(s => s.trim().length > 0);
    const usableChunks = groundingChunks.filter(chunk => chunk.web && chunk.web.uri && chunk.web.title);
    const numArticles = Math.min(textArticles.length, usableChunks.length, 5);

    for(let i=0; i<numArticles; i++) {
        const textArticle = textArticles[i];
        const chunk = usableChunks[i];
        const dateMatch = textArticle.match(/DATE:\s*(.*)/);
        const titleMatch = textArticle.match(/TITLE:\s*(.*)/);
        const blurbMatch = textArticle.match(/BLURB:\s*(.*)/);
        const takeawayMatch = textArticle.match(/TAKEAWAY:\s*(.*)/);
        const bulletsMatch = textArticle.match(/BULLETS:\s*\n((?:\*\s*.*\n?)+)/);

        if (dateMatch?.[1] && titleMatch?.[1] && blurbMatch?.[1] && takeawayMatch?.[1] && bulletsMatch?.[1]) {
            const bulletPoints = bulletsMatch[1].split('*').map(bp => bp.trim()).filter(bp => bp.length > 0);
            if (bulletPoints.length > 0) {
                // FIX: Add missing properties `category`, `year`, and `month` to fix the type error.
                articlesWithoutImages.push({
                    publishedDate: dateMatch[1].trim(),
                    title: titleMatch[1].trim(),
                    blurb: blurbMatch[1].trim(),
                    keyTakeaway: takeawayMatch[1].trim(),
                    bulletPoints: bulletPoints,
                    url: chunk.web.uri,
                    sourceTitle: chunk.web.title,
                    category,
                    year,
                    month,
                });
            }
        }
    }

    if (articlesWithoutImages.length === 0) {
      return [];
    }
    
    const articlesWithImages: NewsArticle[] = [];
    for (const article of articlesWithoutImages) {
      const imageUrl = await generateCartoonIllustration(article.title);
      articlesWithImages.push({
        ...article,
        imageUrl,
      });
    }

    return articlesWithImages;

  } catch (error) {
    console.error(`Error fetching news for query "${query}":`, error);
    return [];
  }
};