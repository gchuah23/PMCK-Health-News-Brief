import { getSupabaseClient } from './supabaseClient';
import { fetchNews as fetchNewsFromGemini } from './geminiService';
import type { NewsArticle } from '../types';

/**
 * Saves a list of articles to the Supabase database.
 * It uses 'upsert' to avoid creating duplicate articles based on the URL.
 * @param articles - An array of NewsArticle objects to save.
 */
const saveArticles = async (articles: NewsArticle[]) => {
  if (articles.length === 0) return;
  const supabase = getSupabaseClient();
  const { error } = await supabase
    .from('articles')
    .upsert(articles, { onConflict: 'url' });

  if (error) {
    console.error('Error saving articles to Supabase:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
    });
  }
};

/**
 * Fetches news articles. It first checks for cached articles in Supabase.
 * If no articles are found or if a force refresh is requested, it fetches
 * new articles from the Gemini API and saves them to Supabase for future use.
 *
 * @param category - The news category (e.g., 'pmck', 'asia', 'global').
 * @param year - The year to filter news by.
 * @param month - The month to filter news by.
 * @param geminiQuery - The specific query to send to the Gemini API.
 * @param geminiExclusionQuery - An exclusion query for the Gemini API.
 * @param forceRefresh - A boolean to bypass the cache and force a new fetch from Gemini.
 * @returns A promise that resolves to an array of NewsArticle objects.
 */
export const getNews = async (
  category: string,
  year: number,
  month: string,
  geminiQuery: string,
  geminiExclusionQuery?: string,
  forceRefresh: boolean = false
): Promise<NewsArticle[]> => {
  const supabase = getSupabaseClient();
  // 1. Check for cached articles in Supabase if not forcing a refresh
  if (!forceRefresh) {
    // Build query dynamically to handle 'All Months'
    let query = supabase
      .from('articles')
      .select('*')
      .eq('category', category)
      .eq('year', year);

    if (month !== 'All Months') {
      query = query.eq('month', month);
    }
    
    const { data, error } = await query;

    if (error) {
      console.error('Error fetching articles from Supabase:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
      });
      throw new Error(`Failed to fetch from Supabase: ${error.message}. Please check your credentials and RLS policies.`);
    } else if (data && data.length > 0) {
      console.log(`Found ${data.length} cached articles in Supabase for ${category}/${year}/${month}.`);
      return data as NewsArticle[];
    }
  }

  // 2. If no cache, or if refresh is forced, fetch from Gemini
  console.log(`Fetching new articles from Gemini for ${category}/${year}/${month}.`);
  const newArticlesFromGemini = await fetchNewsFromGemini(geminiQuery, year, month, category, geminiExclusionQuery);

  // 3. Save to the database
  if (newArticlesFromGemini.length > 0) {
    await saveArticles(newArticlesFromGemini);
  }

  return newArticlesFromGemini;
};