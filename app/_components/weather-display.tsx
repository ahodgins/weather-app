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
import { WeatherAnimation } from './weather-animation';

interface WeatherCardProps {
  icon: React.ReactNode;
  title: string;
  value: React.ReactNode;
  subValue?: React.ReactNode;
}

interface WeatherDisplayProps {
  city: {
    name: string;
    state?: string;
    country: string;
  };
  onLoaded?: () => void;
}

const HOUR_FORMAT_OPTIONS: Intl.DateTimeFormatOptions = {
  hour: 'numeric',
  minute: '2-digit',
  hour12: true,
};

const getWeatherIcon = (condition: string, isDay: boolean = true, size: string = "w-6 h-6") => {
  switch (condition.toLowerCase()) {
    case 'clear':
      return isDay ? <WiDaySunny className={size} /> : <WiNightClear className={size} />;
    case 'clouds':
      return isDay ? <WiDayCloudy className={size} /> : <WiNightAltCloudy className={size} />;
    case 'rain':
    case 'drizzle':
      return <WiRain className={size} />;
    case 'snow':
      return <WiSnow className={size} />;
    case 'thunderstorm':
      return <WiThunderstorm className={size} />;
    case 'mist':
    case 'fog':
    case 'haze':
      return <WiFog className={size} />;
    default:
      return <WiCloudy className={size} />;
  }
};

const WeatherCard = ({ icon, title, value, subValue }: WeatherCardProps) => (
  <div className={`p-4 rounded-2xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700`}>
    <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-1">
      {icon}
      <p>{title}</p>
    </div>
    <p className="text-2xl font-semibold text-gray-900 dark:text-white">
      {value}
    </p>
    {subValue}
  </div>
);

export function WeatherDisplay({ city, onLoaded }: WeatherDisplayProps) {
  const { convertTemp, unit } = useTemperature();
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function fetchWeather() {
      if (!city) return;

      try {
        setLoading(true);
        setError(null);
        const data = await getWeatherByCity(city.name, city.country);
        if (mounted) {
          setWeather(data);
          onLoaded?.();
        }
      } catch (err) {
        if (mounted) {
          setError('Failed to load weather data');
          console.error('Weather fetch error:', err);
          onLoaded?.();
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    fetchWeather();

    return () => {
      mounted = false;
    };
  }, [city, onLoaded]);

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
    <div className="relative p-8 bg-white dark:bg-gray-900 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-800 hover:shadow-2xl transition-all duration-300">
      <WeatherAnimation condition={weather.weather[0].description} />
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
          {[city.name, city.state, city.country].filter(Boolean).join(', ')}
        </h2>
        <TemperatureToggle />
      </div>
      <div className="flex flex-col items-center mb-8">
        <div className="text-gray-600 dark:text-gray-300 mb-4">
          {getWeatherIcon(weather.weather[0].main, isDay, "w-24 h-24")}
        </div>
        <p className="text-6xl font-bold mb-4 text-gray-900 dark:text-white">
          {Math.round(convertTemp(weather.main.temp))}°{unit}
        </p>
        <p className="text-xl capitalize text-gray-600 dark:text-gray-300">
          {weather.weather[0].description}
        </p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <WeatherCard
          icon={<WiThermometer className="w-6 h-6" />}
          title="Feels like"
          value={`${Math.round(convertTemp(weather.main.feels_like))}°${unit}`}
        />
        <WeatherCard
          icon={<WiStrongWind className="w-6 h-6" />}
          title="Wind"
          value={weather.wind?.speed ? `${Math.round(weather.wind.speed)} m/s` : 'N/A'}
          subValue={weather.wind?.deg && (
            <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 mt-1">
              <WiWindDeg className="w-4 h-4" 
                style={{ transform: `rotate(${weather.wind.deg}deg)` }}
              />
              <span>{getWindDirection(weather.wind.deg)}</span>
            </div>
          )}
        />
        <WeatherCard
          icon={<WiHumidity className="w-6 h-6" />}
          title="Humidity"
          value={`${weather.main.humidity}%`}
        />
        <WeatherCard
          icon={<WiRaindrop className="w-6 h-6" />}
          title="Visibility"
          value={weather.visibility 
            ? `${(weather.visibility / 1000).toFixed(1)} km`
            : 'N/A'
          }
        />
      </div>
      <div className="grid grid-cols-2 gap-4 mt-4">
        <WeatherCard
          icon={<WiSunrise className="w-6 h-6" />}
          title="Sunrise"
          value={new Date(weather.sys.sunrise * 1000).toLocaleTimeString('en-US', HOUR_FORMAT_OPTIONS)}
        />
        <WeatherCard
          icon={<WiSunset className="w-6 h-6" />}
          title="Sunset"
          value={new Date(weather.sys.sunset * 1000).toLocaleTimeString('en-US', HOUR_FORMAT_OPTIONS)}
        />
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