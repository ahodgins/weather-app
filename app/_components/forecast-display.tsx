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
      <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-100">
        5-Day Forecast
      </h3>
      <div className="space-y-4">
        {Object.entries(dailyForecasts).map(([date, items]: [string, DailyForecast[]]) => (
          <div key={date} className="p-4 backdrop-blur-lg bg-white/30 dark:bg-gray-800/30 rounded-xl">
            <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">
              {new Date(date).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
            </h4>
            <div className="grid grid-cols-4 gap-4">
              {items.map((item: DailyForecast) => (
                <div key={item.dt} className="text-center">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {new Date(item.dt * 1000).toLocaleTimeString('en-US', { hour: 'numeric' })}
                  </p>
                  <p className="font-medium text-gray-800 dark:text-gray-200">
                    {Math.round(item.main.temp)}°C
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {item.rain?.["3h"] ? `${item.rain["3h"]}mm` : "0mm"}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
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