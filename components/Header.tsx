import React from 'react';

interface HeaderProps {
  lastUpdated: string | null;
  onRefresh: () => void;
  isLoading: boolean;
}

const Header: React.FC<HeaderProps> = ({ lastUpdated, onRefresh, isLoading }) => {
  return (
    <header className="bg-white shadow-md">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-col sm:flex-row justify-between items-center">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-red-700">
              PMCK Health News Brief
            </h1>
            <p className="text-sm text-orange-600 mt-1">
              Your curated health news digest.
            </p>
          </div>
          <div className="flex items-center mt-4 sm:mt-0">
            {lastUpdated && !isLoading && (
              <p className="text-xs text-orange-600 mr-4">
                Last updated: {lastUpdated}
              </p>
            )}
            <button
              onClick={onRefresh}
              disabled={isLoading}
              className="flex items-center px-4 py-2 bg-red-600 text-white font-semibold rounded-lg shadow-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-75 disabled:bg-red-300 disabled:cursor-not-allowed transition-all duration-200"
            >
              <svg 
                className={`w-5 h-5 mr-2 ${isLoading ? 'animate-spin' : ''}`} 
                xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h5" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 9.542A8.966 8.966 0 001.5 12c0 4.97 4.03 9 9 9s9-4.03 9-9-4.03-9-9-9c-2.13 0-4.09.74-5.63 1.99" />
              </svg>
              {isLoading ? 'Refreshing...' : 'Refresh News'}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;