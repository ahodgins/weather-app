'use client';

import { useEffect, useState } from 'react';
import { getForecastByCity } from '@/app/_lib/weather';

interface ForecastDisplayProps {
  city: string;
}

interface DailyForecast {
  dt: number;
  main: {
    temp: number;
    feels_like: number;
    humidity: number;
  };
  weather: Array<{
    description: string;
    icon: string;
    main: string;
  }>;
  rain?: {
    "3h"?: number;
  };
  dt_txt: string;
}

interface ForecastData {
  list: DailyForecast[];
}

export function ForecastDisplay({ city }: ForecastDisplayProps) {
  const [forecast, setForecast] = useState<ForecastData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchForecast() {
      try {
        setLoading(true);
        setError(null);
        const data = await getForecastByCity(city);
        setForecast(data);
      } catch (err) {
        setError('Failed to load forecast data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    if (city) {
      fetchForecast();
    }
  }, [city]);

  if (loading) {
    return (
      <div className="text-center p-8 animate-pulse">
        <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded mx-auto"></div>
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

  if (!forecast) {
    return null;
  }

  // Group forecast by day
  const dailyForecasts = forecast.list.reduce<Record<string, DailyForecast[]>>((acc, item) => {
    const date = new Date(item.dt * 1000).toLocaleDateString();
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(item);
    return acc;
  }, {});

  return (
    <div className="mt-8">
      <h3 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
        5-Day Forecast
      </h3>
      <div className="space-y-4">
        {Object.entries(dailyForecasts).map(([date, items]: [string, DailyForecast[]]) => (
          <div key={date} 
            className="p-6 bg-white dark:bg-gray-900 rounded-3xl shadow-xl 
                      border border-gray-100 dark:border-gray-800
                      hover:shadow-2xl transition-all duration-300">
            <h4 className="font-medium text-gray-900 dark:text-white mb-4">
              {new Date(date).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {items.map((item) => (
                <div key={item.dt} 
                  className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800
                            border border-gray-100 dark:border-gray-700">
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                    {new Date(item.dt * 1000).toLocaleTimeString('en-US', { hour: 'numeric' })}
                  </p>
                  <p className="text-xl font-semibold text-gray-900 dark:text-white mb-1">
                    {Math.round(item.main.temp)}°C
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                    {item.rain?.["3h"] ? `${item.rain["3h"]}mm` : "0mm"}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-300 capitalize">
                    {item.weather[0].description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 