'use client';

import { useEffect, useState } from 'react';
import { getWeatherByCity } from '@/app/_lib/weather';

interface WeatherDisplayProps {
  city: string;
}

export function WeatherDisplay({ city }: WeatherDisplayProps) {
  const [weather, setWeather] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchWeather() {
      try {
        setLoading(true);
        setError(null);
        const data = await getWeatherByCity(city);
        setWeather(data);
      } catch (err) {
        setError('Failed to load weather data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    if (city) {
      fetchWeather();
    }
  }, [city]);

  if (loading) {
    return (
      <div className="text-center p-8 animate-pulse">
        <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded mx-auto mb-4"></div>
        <div className="h-16 w-32 bg-gray-200 dark:bg-gray-700 rounded mx-auto"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-6 bg-red-50 dark:bg-red-900/20 rounded-2xl">
        <p className="text-red-600 dark:text-red-400">{error}</p>
      </div>
    );
  }

  if (!weather) {
    return null;
  }

  return (
    <div className="p-8 backdrop-blur-lg bg-white/30 dark:bg-gray-800/30 rounded-2xl shadow-lg
                    transition-all duration-200 hover:shadow-xl">
      <h2 className="text-3xl font-bold text-center mb-6 text-gray-800 dark:text-gray-100">
        {weather.name}
      </h2>
      <div className="text-center mb-8">
        <p className="text-6xl font-bold mb-4 text-blue-600 dark:text-blue-400">
          {Math.round(weather.main.temp)}°C
        </p>
        <p className="text-xl capitalize text-gray-600 dark:text-gray-300">
          {weather.weather[0].description}
        </p>
      </div>
      <div className="grid grid-cols-2 gap-6">
        <div className="p-4 rounded-xl bg-blue-50/50 dark:bg-blue-900/20">
          <p className="text-gray-500 dark:text-gray-400 mb-1">Feels like</p>
          <p className="text-2xl font-semibold text-gray-800 dark:text-gray-100">
            {Math.round(weather.main.feels_like)}°C
          </p>
        </div>
        <div className="p-4 rounded-xl bg-blue-50/50 dark:bg-blue-900/20">
          <p className="text-gray-500 dark:text-gray-400 mb-1">Humidity</p>
          <p className="text-2xl font-semibold text-gray-800 dark:text-gray-100">
            {weather.main.humidity}%
          </p>
        </div>
      </div>
    </div>
  );
} 