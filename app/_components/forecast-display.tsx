'use client';

import { useEffect, useState } from 'react';
import { getForecastByCity, ForecastData, DailyForecast } from '@/app/_lib/weather';

interface ForecastDisplayProps {
  city: string;
  view: 'hourly' | '3day' | '5day';
}

export function ForecastDisplay({ city, view }: ForecastDisplayProps) {
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

  if (loading || !forecast) return null;
  if (error) return <div className="text-red-500">{error}</div>;

  const processHourlyForecast = () => {
    // Get next 24 hours only
    const next24Hours = forecast.list.slice(0, 8); // API returns 3-hour intervals
    return next24Hours.map(item => (
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
    ));
  };

  const processDailyForecast = (days: number) => {
    const dailyData: { [key: string]: DailyForecast[] } = {};
    
    // Group by day and find min/max
    forecast.list.forEach(item => {
      const date = new Date(item.dt * 1000).toLocaleDateString();
      if (!dailyData[date]) {
        dailyData[date] = [];
      }
      dailyData[date].push(item);
    });

    return (
      <>
        <div className="col-span-full grid grid-cols-3 mb-2 px-4">
          <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Date</div>
          <div className="text-sm font-medium text-gray-500 dark:text-gray-400 text-center">High</div>
          <div className="text-sm font-medium text-gray-500 dark:text-gray-400 text-right">Low</div>
        </div>
        {Object.entries(dailyData)
          .slice(0, days)
          .map(([date, items]) => {
            const minTemp = Math.min(...items.map(item => item.main.temp));
            const maxTemp = Math.max(...items.map(item => item.main.temp));
            const mostFrequentWeather = items[Math.floor(items.length / 2)].weather[0];

            return (
              <div key={date} 
                className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800
                          border border-gray-100 dark:border-gray-700">
                <div className="grid grid-cols-3 items-center mb-2">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {new Date(date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                  </p>
                  <p className="text-xl font-semibold text-gray-900 dark:text-white text-center">
                    {Math.round(maxTemp)}°
                  </p>
                  <p className="text-lg text-gray-500 dark:text-gray-400 text-right">
                    {Math.round(minTemp)}°
                  </p>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300 capitalize">
                  {mostFrequentWeather.description}
                </p>
              </div>
            );
          })}
      </>
    );
  };

  const renderForecast = () => {
    switch (view) {
      case 'hourly':
        return processHourlyForecast();
      case '3day':
        return processDailyForecast(3);
      case '5day':
        return processDailyForecast(5);
      default:
        return null;
    }
  };

  return (
    <div className="mt-8">
      <h3 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
        {view === 'hourly' ? 'Next 24 Hours' : `${view === '3day' ? '3' : '5'}-Day Forecast`}
      </h3>
      <div className={`${view === 'hourly' ? 'grid grid-cols-2 md:grid-cols-4' : 'space-y-2'} gap-4`}>
        {renderForecast()}
      </div>
    </div>
  );
} 