'use client';

import { useEffect, useState } from 'react';
import { getForecastByCity, ForecastData } from '@/app/_lib/weather';
import { useTemperature } from '@/app/_contexts/temperature-context';
import { LoadingSpinner } from './ui/loading-spinner';
import { ErrorDisplay } from './ui/error-display';
import { 
  WiDaySunny, 
  WiNightClear,
  WiCloudy, 
  WiRain, 
  WiSnow, 
  WiThunderstorm, 
  WiFog,
  WiDayCloudy,
  WiNightAltCloudy,
} from 'react-icons/wi';

interface HourlyForecast {
  time: string;
  temp: number;
  condition: string;
  description: string;
}

interface DailyForecast {
  day: string;
  temp: number;
  condition: string;
  description: string;
}

interface ForecastDisplayProps {
  city: {
    name: string;
    country: string;
  };
  view: 'hourly' | '3day' | '5day';
}

const getWeatherIcon = (condition: string, isDay: boolean = true) => {
  switch (condition.toLowerCase()) {
    case 'clear':
      return isDay ? <WiDaySunny className="w-8 h-8" /> : <WiNightClear className="w-8 h-8" />;
    case 'clouds':
      return isDay ? <WiDayCloudy className="w-8 h-8" /> : <WiNightAltCloudy className="w-8 h-8" />;
    case 'rain':
    case 'drizzle':
      return <WiRain className="w-8 h-8" />;
    case 'snow':
      return <WiSnow className="w-8 h-8" />;
    case 'thunderstorm':
      return <WiThunderstorm className="w-8 h-8" />;
    case 'mist':
    case 'fog':
    case 'haze':
      return <WiFog className="w-8 h-8" />;
    default:
      return <WiCloudy className="w-8 h-8" />;
  }
};

export function ForecastDisplay({ city, view }: ForecastDisplayProps) {
  const { convertTemp, unit } = useTemperature();
  const [forecast, setForecast] = useState<ForecastData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchForecast() {
      try {
        setLoading(true);
        setError(null);
        const data = await getForecastByCity(city.name, city.country);
        setForecast(data);
      } catch (err) {
        setError('Failed to load forecast data');
      } finally {
        setLoading(false);
      }
    }

    fetchForecast();
  }, [city]);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorDisplay message={error} />;
  if (!forecast) return null;

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const formatDay = (timestamp: number) => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  const getHourlyForecast = () => {
    return forecast.list.slice(0, 8).map((item) => ({
      time: formatTime(item.dt),
      temp: Math.round(convertTemp(item.main.temp)),
      condition: item.weather[0].main,
      description: item.weather[0].description,
    }));
  };

  const getDailyForecast = (days: number) => {
    const dailyData = forecast.list.filter((item, index) => index % 8 === 0).slice(0, days);
    return dailyData.map((item) => ({
      day: formatDay(item.dt),
      temp: Math.round(convertTemp(item.main.temp)),
      condition: item.weather[0].main,
      description: item.weather[0].description,
    }));
  };

  const forecastData = view === 'hourly' ? getHourlyForecast() : getDailyForecast(view === '3day' ? 3 : 5);

  return (
    <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-800 p-6">
      <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
        {view === 'hourly' ? 'Hourly' : `${view === '3day' ? '3-Day' : '5-Day'}`} Forecast
      </h2>
      <div className={`grid gap-4 ${
        view === 'hourly' 
          ? 'grid-cols-2 sm:grid-cols-4 lg:grid-cols-8' 
          : 'grid-cols-1 sm:grid-cols-3 lg:grid-cols-5'
      }`}>
        {forecastData.map((item, index) => (
          <div 
            key={index}
            className="flex flex-col items-center p-4 bg-gray-50 dark:bg-gray-800 rounded-xl
                     border border-gray-100 dark:border-gray-700 space-y-3"
          >
            <div className="text-sm font-medium text-gray-500 dark:text-gray-400 w-full text-center">
              {view === 'hourly' ? item.time : item.day}
            </div>
            <div className="text-gray-600 dark:text-gray-300">
              {getWeatherIcon(item.condition)}
            </div>
            <div className="text-xl font-bold text-gray-900 dark:text-white">
              {item.temp}°{unit}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 text-center capitalize w-full">
              {item.description}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 