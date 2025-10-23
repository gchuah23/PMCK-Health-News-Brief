import React, { useState } from 'react';
import type { NewsArticle } from '../types';

interface NewsCardProps {
  article: NewsArticle;
  index: number;
}

const NewsCard: React.FC<NewsCardProps> = ({ article }) => {
  const { title, blurb, url, sourceTitle, imageUrl, publishedDate, keyTakeaway, bulletPoints } = article;
  const [isCopied, setIsCopied] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const handleShare = async () => {
    const shareData = {
      title: title,
      text: blurb,
      url: url,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.error("Error sharing:", err);
      }
    } else {
      try {
        await navigator.clipboard.writeText(url);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
      } catch (err) {
        console.error("Failed to copy URL:", err);
        alert("Failed to copy link. Please copy it manually.");
      }
    }
  };
  
  const toggleExpand = () => setIsExpanded(!isExpanded);

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden flex flex-col transform hover:-translate-y-1 transition-transform duration-300 ease-in-out border border-slate-200">
      <div className="flex flex-col md:flex-row">
        <div className="md:w-1/3">
          <img className="h-48 w-full object-cover md:h-full" src={imageUrl} alt={`Illustration for ${title}`} />
        </div>
        <div className="p-6 flex flex-col justify-between md:w-2/3">
          <div>
            <p className="text-xs font-medium text-red-600 mb-2 tracking-wider uppercase">{publishedDate}</p>
            <h3 className="text-xl font-bold text-slate-800 mb-2">{title}</h3>
            <p className="text-slate-600 text-sm leading-relaxed">{blurb}</p>
          </div>
          <div className="mt-4 flex items-center justify-between flex-wrap gap-2">
              <a 
                href={url} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="inline-flex items-center text-orange-600 hover:text-orange-800 font-semibold text-sm self-start group"
              >
                Read Full Story on "{sourceTitle}"
                <svg className="ml-2 w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
              </a>
              <div className="flex items-center gap-2">
                <button
                  onClick={toggleExpand}
                  className="flex items-center px-3 py-2 text-sm font-semibold text-slate-700 bg-slate-100 border border-slate-200 rounded-md hover:bg-slate-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 transition-colors duration-200"
                  aria-expanded={isExpanded}
                >
                  <svg className={`w-4 h-4 mr-2 transform transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                  {isExpanded ? 'Collapse' : 'Expand'}
                </button>
                <button
                  onClick={handleShare}
                  className="relative flex items-center px-3 py-2 text-sm font-semibold text-orange-700 bg-white border border-orange-200 rounded-md hover:bg-orange-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-colors duration-200"
                  aria-label="Share article"
                >
                  <svg className="w-4 h-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12s-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6.002l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.367a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                  </svg>
                  {isCopied ? 'Link Copied!' : 'Share'}
                </button>
              </div>
          </div>
        </div>
      </div>
      <div className={`transition-all duration-500 ease-in-out ${isExpanded ? 'max-h-screen' : 'max-h-0'} overflow-hidden`}>
        <div className="p-6 border-t border-slate-200">
          <h4 className="text-md font-bold text-slate-800">Key Takeaway</h4>
          <p className="text-slate-600 text-sm mt-1 mb-4">{keyTakeaway}</p>
          <h4 className="text-md font-bold text-slate-800">Summary Points</h4>
          <ul className="list-disc list-inside mt-2 space-y-1 text-slate-600 text-sm">
            {bulletPoints.map((point, i) => (
              <li key={i}>{point}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default NewsCard;