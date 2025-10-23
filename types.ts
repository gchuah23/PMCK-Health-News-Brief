export interface NewsArticle {
  title: string;
  blurb: string;
  url: string;
  sourceTitle: string;
  imageUrl: string;
  publishedDate: string;
  keyTakeaway: string;
  bulletPoints: string[];
  // Fields for Supabase querying
  category: string;
  year: number;
  month: string;
}