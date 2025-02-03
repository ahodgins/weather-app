'use client';

import { useState, useEffect, useRef } from 'react';
import { getCitySuggestions } from '@/app/_lib/cities';

interface Location {
  name: string;
  state?: string;
  country: string;
}

interface SearchBoxProps {
  onSearch: (location: Location) => void;
  disabled?: boolean;
}

export function SearchBox({ onSearch, disabled }: SearchBoxProps) {
  const [input, setInput] = useState('');
  const [suggestions, setSuggestions] = useState<Array<{name: string; country: string; state?: string}>>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (input.length >= 2 && !disabled) {
        const cities = await getCitySuggestions(input);
        setSuggestions(cities);
        setShowSuggestions(true);
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    };

    const debounceTimer = setTimeout(fetchSuggestions, 100);
    return () => clearTimeout(debounceTimer);
  }, [input, disabled]);

  const handleSuggestionClick = (location: Location) => {
    setShowSuggestions(false);
    setSuggestions([]);
    
    const displayName = [
      location.name,
      location.state,
      location.country
    ].filter(Boolean).join(', ');
    
    setInput(displayName);
    
    if (inputRef.current) {
      inputRef.current.blur();
    }
    onSearch(location);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      onSearch({ name: input.trim(), country: '' });
      setShowSuggestions(false);
      inputRef.current?.blur();
    }
  };

  return (
    <div ref={searchContainerRef} className="relative">
      <form 
        onSubmit={handleSubmit}
        className="flex gap-2 p-3 bg-white dark:bg-gray-900 rounded-3xl 
                 shadow-xl border border-gray-100 dark:border-gray-800
                 hover:shadow-2xl transition-all duration-300"
      >
        <input
          ref={inputRef}
          type="text"
          value={input}
          disabled={disabled}
          onChange={(e) => setInput(e.target.value)}
          onBlur={() => {
            setTimeout(() => {
              if (document.activeElement !== inputRef.current) {
                setShowSuggestions(false);
              }
            }, 150);
          }}
          placeholder="Enter city name..."
          className="flex-1 px-4 py-3 rounded-2xl bg-gray-50 dark:bg-gray-800 
                   border border-gray-100 dark:border-gray-700
                   focus:outline-none focus:ring-2 focus:ring-gray-200 dark:focus:ring-gray-700
                   text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500
                   transition-all duration-200
                   disabled:opacity-50 disabled:cursor-not-allowed"
        />
        <button
          type="submit"
          disabled={disabled}
          className="px-6 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 
                   font-medium rounded-xl transition-all duration-200
                   hover:bg-gray-800 dark:hover:bg-gray-100
                   focus:outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-700
                   disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Search
        </button>
      </form>

      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute w-full mt-2 py-2 bg-white dark:bg-gray-900 rounded-xl shadow-lg 
                      border border-gray-200 dark:border-gray-800 z-10">
          {suggestions.map((city, index) => (
            <button
              key={`${city.name}-${city.country}-${index}`}
              onClick={() => handleSuggestionClick(city)}
              type="button"
              className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-800
                       text-gray-900 dark:text-gray-100 transition-colors duration-150"
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