'use client';

interface ForecastSelectorProps {
  onSelect: (view: 'hourly' | '3day' | '5day') => void;
  currentView: 'hourly' | '3day' | '5day';
}

export function ForecastSelector({ onSelect, currentView }: ForecastSelectorProps) {
  return (
    <div className="flex justify-center mb-8">
      <div className="inline-flex p-1 bg-gray-100 dark:bg-gray-800 rounded-xl">
        <button
          onClick={() => onSelect('hourly')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
                    ${currentView === 'hourly' 
                      ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm' 
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}
        >
          Hourly
        </button>
        <button
          onClick={() => onSelect('3day')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
                    ${currentView === '3day' 
                      ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm' 
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}
        >
          3-Day
        </button>
        <button
          onClick={() => onSelect('5day')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
                    ${currentView === '5day' 
                      ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm' 
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}
        >
          5-Day
        </button>
      </div>
    </div>
  );
} 