'use client';

import { useState, useEffect, useRef } from 'react';
import { getCitySuggestions } from '@/app/_lib/cities';

interface SearchBoxProps {
  onSearch: (city: string) => void;
}

export function SearchBox({ onSearch }: SearchBoxProps) {
  const [input, setInput] = useState('');
  const [suggestions, setSuggestions] = useState<Array<{name: string; country: string; state?: string}>>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (input.length >= 2) {
        const cities = await getCitySuggestions(input);
        setSuggestions(cities);
        setShowSuggestions(true);
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    };

    const debounceTimer = setTimeout(fetchSuggestions, 150);
    return () => clearTimeout(debounceTimer);
  }, [input]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      onSearch(input.trim());
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (cityName: string) => {
    setInput(cityName);
    onSearch(cityName);
    setShowSuggestions(false);
  };

  return (
    <div ref={searchContainerRef} className="relative">
      <form onSubmit={handleSubmit} className="flex gap-2 p-2 backdrop-blur-lg bg-white/30 dark:bg-gray-800/30 rounded-2xl shadow-lg">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Enter city name..."
          className="flex-1 px-4 py-3 rounded-xl bg-white/50 dark:bg-gray-900/50 border-0 
                   focus:outline-none focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-500
                   text-gray-800 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400
                   transition-all duration-200"
        />
        <button
          type="submit"
          className="px-6 py-3 bg-blue-500 hover:bg-blue-600 active:bg-blue-700 
                   text-white font-medium rounded-xl transition-all duration-200
                   shadow-md hover:shadow-lg focus:outline-none focus:ring-2 
                   focus:ring-blue-400 dark:focus:ring-blue-500"
        >
          Search
        </button>
      </form>

      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute w-full mt-2 py-2 bg-white dark:bg-gray-800 rounded-xl shadow-lg z-10
                      backdrop-blur-lg bg-white/90 dark:bg-gray-800/90">
          {suggestions.map((city, index) => (
            <button
              key={`${city.name}-${city.country}-${index}`}
              onClick={() => handleSuggestionClick(city.name)}
              className="w-full px-4 py-2 text-left hover:bg-blue-50 dark:hover:bg-blue-900/30
                       text-gray-800 dark:text-gray-100 transition-colors duration-150"
            >
              <span className="font-medium">{city.name}</span>
              <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">
                {city.state ? `${city.state}, ` : ''}{city.country}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
} 