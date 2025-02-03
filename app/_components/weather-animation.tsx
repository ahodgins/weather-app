'use client';

import { motion } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import { getCitySuggestions } from '@/app/_lib/cities';

// Helper to get a random number between min and max
const getRandom = (min: number, max: number) => Math.random() * (max - min) + min;

interface ParticleProps {
  key: number;
  type: 'snow' | 'rain';
}

function Particle({ type }: ParticleProps) {
  const [xPos] = useState(() => getRandom(0, 100));
  const [size] = useState(() => getRandom(4, type === 'snow' ? 12 : 8));
  const [delay] = useState(() => getRandom(0, 5));
  const [duration] = useState(() => getRandom(type === 'snow' ? 10 : 7, type === 'snow' ? 20 : 15));

  return (
    <motion.div
      className="dark:bg-white bg-gray-700"
      style={{
        position: 'absolute',
        top: -20,
        left: `${xPos}%`,
        width: type === 'snow' ? size : 1,
        height: type === 'snow' ? size : size * 2,
        borderRadius: type === 'snow' ? '50%' : 'none',
        filter: 'blur(1px)',
        opacity: type === 'snow' ? 0.6 : 0.4,
      }}
      animate={{
        y: ['0vh', '100vh'],
        x: type === 'snow' ? ['-10px', '10px'] : '0px',
      }}
      transition={{
        y: {
          duration: duration,
          repeat: Infinity,
          ease: 'linear',
          delay: delay,
        },
        x: type === 'snow' ? {
          duration: 2,
          repeat: Infinity,
          repeatType: 'reverse',
          ease: 'easeInOut',
        } : undefined,
      }}
    />
  );
}

interface WeatherAnimationProps {
  condition: string;
}

export function WeatherAnimation({ condition }: WeatherAnimationProps) {
  // Normalize the condition to lowercase for easier matching
  const normalizedCondition = condition.toLowerCase();

  // Determine the type of animation based on the condition
  let animationType: 'snow' | 'rain' | null = null;

  if (normalizedCondition.includes('snow')) {
    animationType = 'snow';
  } else if (
    normalizedCondition.includes('rain') || 
    normalizedCondition.includes('drizzle') ||
    normalizedCondition.includes('shower')
  ) {
    animationType = 'rain';
  }

  // If no matching animation, return null
  if (!animationType) return null;

  // Generate particles
  const particles = Array.from({ length: animationType === 'snow' ? 50 : 100 }, (_, i) => i);

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        overflow: 'hidden',
        pointerEvents: 'none',
        zIndex: 0,
      }}
    >
      {particles.map((id) => (
        <Particle key={id} type={animationType!} />
      ))}
    </div>
  );
}

interface Location {
  name: string;
  state?: string;
  country: string;
}

interface SearchBoxProps {
  onSearch: (location: Location) => void;
}

export function SearchBox({ onSearch }: SearchBoxProps) {
  const [input, setInput] = useState('');
  const [suggestions, setSuggestions] = useState<Array<{name: string; country: string; state?: string}>>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

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

    const debounceTimer = setTimeout(fetchSuggestions, 100);
    return () => clearTimeout(debounceTimer);
  }, [input]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedLocation) {
      onSearch(selectedLocation);
      setShowSuggestions(false); // Hide suggestions immediately
    } else if (input.trim()) {
      onSearch({ name: input.trim(), country: '' });
      setShowSuggestions(false); // Hide suggestions immediately
    }
    inputRef.current?.blur(); // Blur the input
  };

  const handleSuggestionClick = (location: Location) => {
    const displayName = [
      location.name,
      location.state,
      location.country
    ].filter(Boolean).join(', ');

    setInput(displayName);
    setSelectedLocation(location);
    setSuggestions([]);
    onSearch(location);
    
    // Hide suggestions and blur the input
    setShowSuggestions(false);
    inputRef.current?.blur();
  };

  return (
    <div ref={searchContainerRef} className="relative">
      <form onSubmit={handleSubmit} 
        className="flex gap-2 p-3 bg-white dark:bg-gray-900 rounded-3xl 
                 shadow-xl border border-gray-100 dark:border-gray-800
                 hover:shadow-2xl transition-all duration-300">
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            setSelectedLocation(null);
          }}
          placeholder="Enter city name..."
          className="flex-1 px-4 py-3 rounded-2xl bg-gray-50 dark:bg-gray-800 
                   border border-gray-100 dark:border-gray-700
                   focus:outline-none focus:ring-2 focus:ring-gray-200 dark:focus:ring-gray-700
                   text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500
                   transition-all duration-200"
        />
        <button
          type="submit"
          className="px-6 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 
                   font-medium rounded-xl transition-all duration-200
                   hover:bg-gray-800 dark:hover:bg-gray-100
                   focus:outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-700"
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
              tabIndex={-1}
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