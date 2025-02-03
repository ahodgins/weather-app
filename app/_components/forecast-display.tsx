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

type ForecastItem = {
  temp: number;
  condition: string;
  description: string;
  precipitation?: string;
} & ({ time: string } | { day: string });

interface ForecastDisplayProps {
  city: {
    name: string;
    country: string;
  };
  view: 'hourly' | '5day';
}

interface ForecastItemData {
  dt: number;
  main: {
    temp: number;
  };
  weather: Array<{
    main: string;
    description: string;
  }>;
  rain?: {
    '1h'?: number;
    '3h'?: number;
  };
  snow?: {
    '1h'?: number;
    '3h'?: number;
  };
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
      } catch {
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

  const getPrecipitation = (item: ForecastItemData): string | undefined => {
    const rain = item.rain?.['1h'] || item.rain?.['3h'];
    const snow = item.snow?.['1h'] || item.snow?.['3h'];
    
    if (rain || snow) {
      const amount = (rain || snow) / 10; // Convert to cm
      return `${amount.toFixed(2)} cm`;
    }
    return undefined;
  };

  const getHourlyForecast = (): ForecastItem[] => {
    return forecast.list.slice(0, 8).map((item) => {
      const precip = getPrecipitation(item);
      console.log('Forecast item:', { 
        time: formatTime(item.dt), 
        precipitation: precip 
      });
      
      return {
        time: formatTime(item.dt),
        temp: Math.round(convertTemp(item.main.temp)),
        condition: item.weather[0].main,
        description: item.weather[0].description,
        precipitation: precip,
      };
    });
  };

  const getDailyForecast = (days: number): ForecastItem[] => {
    const dailyData = forecast.list.filter((item, index) => index % 8 === 0).slice(0, days);
    return dailyData.map((item) => ({
      day: formatDay(item.dt),
      temp: Math.round(convertTemp(item.main.temp)),
      condition: item.weather[0].main,
      description: item.weather[0].description,
    }));
  };

  const forecastData = view === 'hourly' ? getHourlyForecast() : getDailyForecast(5);

  return (
    <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-800 p-6">
      <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
        {view === 'hourly' ? 'Hourly' : '5-Day'} Forecast
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
                       border border-gray-100 dark:border-gray-700 h-[180px]"
          >
            <div className="text-sm font-medium text-gray-500 dark:text-gray-400 w-full text-center">
              {view === 'hourly' ? item.time : item.day}
            </div>
            <div className="flex-1 flex flex-col items-center justify-center gap-2">
              <div className="text-gray-600 dark:text-gray-300">
                {getWeatherIcon(item.condition)}
              </div>
              <div className="text-xl font-bold text-gray-900 dark:text-white">
                {item.temp}°{unit}
              </div>
            </div>
            <div className="flex flex-col items-center">
              <div className="text-xs text-gray-500 dark:text-gray-400 text-center capitalize">
                {item.description}
              </div>
              {item.precipitation && (
                <div className="text-xs font-medium text-blue-600 dark:text-blue-400">
                  {item.precipitation}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 