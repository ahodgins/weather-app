'use client';

import { useState } from 'react';
import { WeatherDisplay } from '@/app/_components/weather-display';
import { ForecastDisplay } from '@/app/_components/forecast-display';
import { SearchBox } from '@/app/_components/search-box';
import { ThemeToggle } from '@/app/_components/theme-toggle';

export default function Home() {
  const [city, setCity] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = (searchCity: string) => {
    setCity(searchCity);
    setIsSearching(true);
  };

  return (
    <main className="min-h-screen p-4 sm:p-8 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-gray-900 dark:to-blue-950 transition-colors duration-200">
      <ThemeToggle />
      <div className="max-w-4xl mx-auto space-y-8 pt-8">
        <h1 className="text-4xl font-bold text-center text-blue-900 dark:text-blue-100 transition-colors duration-200">
          Weather App
        </h1>
        <SearchBox onSearch={handleSearch} />
        {isSearching && (
          <>
            <WeatherDisplay city={city} />
            <ForecastDisplay city={city} />
          </>
        )}
      </div>
    </main>
  );
}
