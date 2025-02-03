'use client';

import { useEffect, useState } from 'react';
import { getWeatherByCity, WeatherData } from '@/app/_lib/weather';
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
  WiThermometer,
  WiStrongWind,
  WiHumidity,
  WiSunrise,
  WiSunset,
  WiRaindrop,
  WiWindDeg
} from 'react-icons/wi';
import { useTemperature } from '@/app/_contexts/temperature-context';
import { TemperatureToggle } from './temperature-toggle';

interface WeatherDisplayProps {
  city: string;
}

const getWeatherIcon = (condition: string, isDay: boolean = true, size: "sm" | "md" | "lg" = "md") => {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-12 h-12",
    lg: "w-20 h-20"
  };

  const iconClass = sizeClasses[size];

  switch (condition.toLowerCase()) {
    case 'clear':
      return isDay ? <WiDaySunny className={iconClass} /> : <WiNightClear className={iconClass} />;
    case 'clouds':
      return isDay ? <WiDayCloudy className={iconClass} /> : <WiNightAltCloudy className={iconClass} />;
    case 'rain':
    case 'drizzle':
      return <WiRain className={iconClass} />;
    case 'snow':
      return <WiSnow className={iconClass} />;
    case 'thunderstorm':
      return <WiThunderstorm className={iconClass} />;
    case 'mist':
    case 'fog':
    case 'haze':
      return <WiFog className={iconClass} />;
    default:
      return <WiCloudy className={iconClass} />;
  }
};

export function WeatherDisplay({ city }: WeatherDisplayProps) {
  const { convertTemp, unit } = useTemperature();
  const [weather, setWeather] = useState<WeatherData | null>(null);
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

  const hour = new Date().getHours();
  const isDay = hour >= 6 && hour < 18;

  return (
    <div className="p-8 bg-white dark:bg-gray-900 rounded-3xl shadow-xl 
                  border border-gray-100 dark:border-gray-800
                  hover:shadow-2xl transition-all duration-300">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
          {weather.name}
        </h2>
        <TemperatureToggle />
      </div>
      <div className="flex flex-col items-center mb-8">
        <div className="text-gray-600 dark:text-gray-300 mb-4">
          {getWeatherIcon(weather.weather[0].main, isDay, "lg")}
        </div>
        <p className="text-6xl font-bold mb-4 text-gray-900 dark:text-white">
          {Math.round(convertTemp(weather.main.temp))}°{unit}
        </p>
        <p className="text-xl capitalize text-gray-600 dark:text-gray-300">
          {weather.weather[0].description}
        </p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800
                      border border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-1">
            <WiThermometer className="w-6 h-6" />
            <p>Feels like</p>
          </div>
          <p className="text-2xl font-semibold text-gray-900 dark:text-white">
            {Math.round(convertTemp(weather.main.feels_like))}°{unit}
          </p>
        </div>
        <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800
                      border border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-1">
            <WiStrongWind className="w-6 h-6" />
            <p>Wind</p>
          </div>
          <p className="text-2xl font-semibold text-gray-900 dark:text-white">
            {Math.round(weather.wind.speed)} m/s
          </p>
          <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 mt-1">
            <WiWindDeg className="w-4 h-4" 
              style={{ transform: `rotate(${weather.wind.deg}deg)` }}
            />
            <span>{getWindDirection(weather.wind.deg)}</span>
          </div>
        </div>
        <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800
                      border border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-1">
            <WiHumidity className="w-6 h-6" />
            <p>Humidity</p>
          </div>
          <p className="text-2xl font-semibold text-gray-900 dark:text-white">
            {weather.main.humidity}%
          </p>
        </div>
        <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800
                      border border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-1">
            <WiRaindrop className="w-6 h-6" />
            <p>Visibility</p>
          </div>
          <p className="text-2xl font-semibold text-gray-900 dark:text-white">
            {(weather.visibility / 1000).toFixed(1)} km
          </p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4 mt-4">
        <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800
                      border border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-1">
            <WiSunrise className="w-6 h-6" />
            <p>Sunrise</p>
          </div>
          <p className="text-xl font-semibold text-gray-900 dark:text-white">
            {new Date(weather.sys.sunrise * 1000).toLocaleTimeString('en-US', { 
              hour: 'numeric',
              minute: '2-digit',
              hour12: true
            })}
          </p>
        </div>
        <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800
                      border border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-1">
            <WiSunset className="w-6 h-6" />
            <p>Sunset</p>
          </div>
          <p className="text-xl font-semibold text-gray-900 dark:text-white">
            {new Date(weather.sys.sunset * 1000).toLocaleTimeString('en-US', { 
              hour: 'numeric',
              minute: '2-digit',
              hour12: true
            })}
          </p>
        </div>
      </div>
    </div>
  );
}

function getWindDirection(degrees: number): string {
  const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE',
                     'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  const index = Math.round(((degrees % 360) / 22.5));
  return directions[index % 16];
} 