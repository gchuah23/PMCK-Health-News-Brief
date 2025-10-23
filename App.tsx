import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import NewsCard from './components/NewsCard';
import LoadingSpinner from './components/LoadingSpinner';
import NavBar from './components/NavBar';
import SupabaseSettings from './components/SupabaseSettings';
import { getNews } from './services/newsService';
import { initializeSupabaseClient } from './services/supabaseClient';
import type { NewsArticle } from './types';

const QUERIES = {
  pmck: { 
    query: 'Putra Medical Centre Alor Setar' 
  },
  asia: { 
    query: 'breaking health news in Asia', 
    exclusion: 'Exclude news specifically and only about Putra Medical Centre Alor Setar' 
  },
  global: { 
    query: 'global breaking health news', 
    exclusion: 'Exclude news focused only on Asia or Putra Medical Centre Alor Setar' 
  },
};

type ActiveTab = 'pmck' | 'asia' | 'global';

const App: React.FC = () => {
  const [isSupabaseConfigured, setIsSupabaseConfigured] = useState(false);
  const [activeTab, setActiveTab] = useState<ActiveTab>('pmck');
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [selectedYear, setSelectedYear] = useState<number>(2025);
  const [selectedMonth, setSelectedMonth] = useState<string>('All Months');

  useEffect(() => {
    try {
      const savedUrl = localStorage.getItem('supabaseUrl');
      const savedKey = localStorage.getItem('supabaseAnonKey');
      if (savedUrl && savedKey) {
        initializeSupabaseClient(savedUrl, savedKey);
        setIsSupabaseConfigured(true);
      } else {
        setIsLoading(false);
      }
    } catch (e) {
      console.error("Error during initial setup:", e);
      setIsLoading(false);
    }
  }, []);
  
  const handleSaveSettings = (url: string, key: string) => {
    localStorage.setItem('supabaseUrl', url);
    localStorage.setItem('supabaseAnonKey', key);
    initializeSupabaseClient(url, key);
    setIsSupabaseConfigured(true);
  };

  const loadNews = useCallback(async (forceRefresh: boolean = false) => {
    setIsLoading(true);
    setError(null);
    try {
      const { query, exclusion } = QUERIES[activeTab];
      const result = await getNews(activeTab, selectedYear, selectedMonth, query, exclusion, forceRefresh);

      const sortedResult = result.sort((a, b) => {
        const dateA = new Date(a.publishedDate);
        const dateB = new Date(b.publishedDate);
        if (isNaN(dateA.getTime())) return 1;
        if (isNaN(dateB.getTime())) return -1;
        return dateB.getTime() - dateA.getTime();
      });
      
      setNews(sortedResult);
      if (forceRefresh || (!lastUpdated && result.length > 0)) {
        setLastUpdated(new Date().toLocaleTimeString());
      }
    } catch (err) {
      console.error("Failed to load news:", err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unknown error occurred while fetching the news. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  }, [activeTab, selectedYear, selectedMonth, lastUpdated]);

  useEffect(() => {
    if (isSupabaseConfigured) {
      loadNews(false);
    }
  }, [activeTab, selectedYear, selectedMonth, isSupabaseConfigured]);

  const getSectionTitle = () => {
    let title;
    switch(activeTab) {
      case 'pmck': title = 'Putra Medical Centre, Alor Setar'; break;
      case 'asia': title = 'Asia Health News'; break;
      case 'global': title = 'Global Health News'; break;
      default: title = 'Health News';
    }
    const monthLabel = selectedMonth === 'All Months' ? '' : `${selectedMonth} `;
    return `${title} - ${monthLabel}${selectedYear}`;
  };
  
  const handleRefresh = () => loadNews(true);

  const renderNewsSection = (title: string, articles: NewsArticle[]) => (
    <div className="bg-yellow-100 p-4 sm:p-6 rounded-lg shadow-inner">
      <h2 className="text-2xl font-bold text-slate-800 mb-6 pb-2 border-b-2 border-orange-400">{title}</h2>
      {articles.length > 0 ? (
        <div className="grid grid-cols-1 gap-6">
          {articles.map((article, index) => (
            <NewsCard key={`${article.url}-${index}`} article={article} index={index} />
          ))}
        </div>
      ) : (
        <div className="text-center py-10 px-6 bg-yellow-200 rounded-lg">
            <h3 className="text-lg font-semibold text-slate-600">No news found.</h3>
            <p className="text-slate-500 mt-2">There might be no recent updates for this topic and date. Try a different selection or refresh later.</p>
        </div>
      )}
    </div>
  );

  if (!isSupabaseConfigured) {
    return (
      <div className="min-h-screen bg-yellow-50 font-sans">
        <SupabaseSettings onSave={handleSaveSettings} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-yellow-50 font-sans">
      <Header 
        lastUpdated={lastUpdated} 
        onRefresh={handleRefresh} 
        isLoading={isLoading} 
      />
      <main className="container mx-auto p-4 sm:p-6 lg:p-8">
        <NavBar
          activeTab={activeTab}
          onTabChange={(tab) => {
            setActiveTab(tab);
            setLastUpdated(null); 
          }}
          selectedYear={selectedYear}
          onYearChange={setSelectedYear}
          selectedMonth={selectedMonth}
          onMonthChange={setSelectedMonth}
        />
        {isLoading ? (
          <LoadingSpinner 
            message="Loading News..."
            subMessage="Checking for the latest updates. This may take a moment."
          />
        ) : error ? (
          <div className="text-center py-10 px-6 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            <h3 className="text-lg font-semibold">An Error Occurred</h3>
            <p className="mt-2 text-sm">{error}</p>
            <button
              onClick={handleRefresh}
              className="mt-4 flex items-center mx-auto px-4 py-2 bg-red-600 text-white font-semibold rounded-lg shadow-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-75"
            >
              <svg className="w-5 h-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h5" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 9.542A8.966 8.966 0 001.5 12c0 4.97 4.03 9 9 9s9-4.03 9-9-4.03-9-9-9c-2.13 0-4.09.74-5.63 1.99" />
              </svg>
              Try Again
            </button>
          </div>
        ) : (
          renderNewsSection(getSectionTitle(), news)
        )}
      </main>
    </div>
  );
};

export default App;