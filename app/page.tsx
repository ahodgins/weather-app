'use client';

import { useState } from 'react';
import Head from 'next/head';
import { WeatherDisplay } from '@/app/_components/weather-display';
import { ForecastDisplay } from '@/app/_components/forecast-display';
import { SearchBox } from '@/app/_components/search-box';
import { ThemeToggle } from '@/app/_components/theme-toggle';
import { ForecastSelector } from '@/app/_components/forecast-selector';
import { TemperatureProvider } from '@/app/_contexts/temperature-context';

type ForecastView = 'hourly' | '5day';

interface Location {
  name: string;
  state?: string;
  country: string;
}

export default function Home() {
  const [location, setLocation] = useState<Location | null>(null);
  const [forecastView, setForecastView] = useState<ForecastView>('hourly');

  const handleSearch = (searchLocation: Location) => {
    setLocation(searchLocation);
  };

  return (
    <TemperatureProvider>
      <Head>
        <title>{location ? `${location.name}, ${location.state || ''} ${location.country}` : 'Weather Forecast'}</title>
      </Head>
      <main className="min-h-screen bg-white dark:bg-black text-gray-900 dark:text-gray-100">
        <ThemeToggle />
        <div className="max-w-4xl mx-auto p-6 sm:p-8 space-y-8">
          <h1 className="text-5xl font-bold text-center text-gray-900 dark:text-white">
            Weather Forecast
          </h1>
          <p className="text-center text-gray-500 dark:text-gray-400 text-lg max-w-2xl mx-auto">
            Get real-time weather updates and forecasts for any city worldwide
          </p>
          <SearchBox onSearch={handleSearch} />
          {location && (
            <div className="space-y-8 mt-12">
              <WeatherDisplay city={location} />
              <ForecastSelector 
                onSelect={setForecastView} 
                currentView={forecastView} 
              />
              <ForecastDisplay 
                city={location}
                view={forecastView}
              />
            </div>
          )}
        </div>
      </main>
    </TemperatureProvider>
  );
}
