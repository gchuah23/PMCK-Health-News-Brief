import React from 'react';

type Tab = 'pmck' | 'asia' | 'global';

interface NavBarProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
  selectedYear: number;
  onYearChange: (year: number) => void;
  selectedMonth: string;
  onMonthChange: (month: string) => void;
}

const TABS: { id: Tab; label: string }[] = [
  { id: 'pmck', label: 'PMCK' },
  { id: 'asia', label: 'Asia' },
  { id: 'global', label: 'Global' },
];

const YEARS = [2025, 2024, 2023, 2022];
const MONTHS = [
  'All Months', 'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const NavBar: React.FC<NavBarProps> = ({ 
  activeTab, onTabChange, 
  selectedYear, onYearChange, 
  selectedMonth, onMonthChange 
}) => {
  const baseButtonClasses = "w-full sm:w-auto flex-grow text-center px-6 py-3 text-base font-bold rounded-lg transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500";
  const activeButtonClasses = "bg-gradient-to-r from-red-500 to-orange-400 text-white shadow-lg";
  const inactiveButtonClasses = "bg-white text-orange-700 border border-orange-200 hover:bg-orange-50 hover:border-orange-400 shadow-sm";
  
  const selectClasses = "px-4 py-3 text-base font-bold rounded-lg transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 shadow-sm bg-white text-slate-700 border border-slate-300 hover:bg-slate-50";

  return (
    <nav className="p-4 rounded-lg mb-8">
      <div className="flex flex-col md:flex-row items-center justify-center gap-4">
        {/* Category Tabs */}
        <div className="w-full md:w-auto flex flex-col sm:flex-row items-center justify-center gap-4">
          {TABS.map(({ id, label }) => (
            <button
              key={id}
              onClick={() => onTabChange(id)}
              className={`${baseButtonClasses} ${activeTab === id ? activeButtonClasses : inactiveButtonClasses}`}
              aria-pressed={activeTab === id}
            >
              {label}
            </button>
          ))}
        </div>
        
        {/* Date Filters */}
        <div className="w-full md:w-auto flex items-center justify-center gap-4 mt-4 md:mt-0">
          <select 
            value={selectedMonth} 
            onChange={(e) => onMonthChange(e.target.value)}
            className={selectClasses}
            aria-label="Select month"
          >
            {MONTHS.map(month => (
              <option key={month} value={month}>{month}</option>
            ))}
          </select>
          <select 
            value={selectedYear} 
            onChange={(e) => onYearChange(parseInt(e.target.value, 10))}
            className={selectClasses}
            aria-label="Select year"
          >
            {YEARS.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>
      </div>
    </nav>
  );
};

export default NavBar;