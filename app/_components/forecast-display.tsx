'use client';

import { useEffect, useState, useMemo } from 'react';
import { getForecastByCity, ForecastData, DailyForecast } from '@/app/_lib/weather';
import { 
  WiDaySunny, 
  WiNightClear,
  WiCloudy, 
  WiRain, 
  WiSnow, 
  WiThunderstorm, 
  WiFog,
  WiDayCloudy,
  WiNightAltCloudy
} from 'react-icons/wi';
import { useTemperature } from '@/app/_contexts/temperature-context';
import { LoadingSpinner } from '@/app/_components/ui/loading-spinner';
import { ErrorDisplay } from '@/app/_components/ui/error-display';

interface ForecastDisplayProps {
  city: {
    name: string;
    country: string;
  };
  view: 'hourly' | '3day' | '5day';
}

function getWindDirection(degrees: number): string {
  const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE',
                     'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  const index = Math.round(((degrees % 360) / 22.5));
  return directions[index % 16];
}

const getWeatherIcon = (condition: string, isDay: boolean = true, className: string = "w-12 h-12") => {
  switch (condition.toLowerCase()) {
    case 'clear':
      return isDay ? <WiDaySunny className={className} /> : <WiNightClear className={className} />;
    case 'clouds':
      return isDay ? <WiDayCloudy className={className} /> : <WiNightAltCloudy className={className} />;
    case 'rain':
    case 'drizzle':
      return <WiRain className={className} />;
    case 'snow':
      return <WiSnow className={className} />;
    case 'thunderstorm':
      return <WiThunderstorm className={className} />;
    case 'mist':
    case 'fog':
    case 'haze':
      return <WiFog className={className} />;
    default:
      return <WiCloudy className={className} />;
  }
};

export function ForecastDisplay({ city, view }: ForecastDisplayProps) {
  const { convertTemp } = useTemperature();
  const [forecast, setForecast] = useState<ForecastData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const processDailyForecast = useMemo(() => {
    if (!forecast) return [];

    const dailyData: { [key: string]: DailyForecast[] } = {};
    
    forecast.list.forEach(item => {
      const date = new Date(item.dt * 1000).toLocaleDateString();
      if (!dailyData[date]) {
        dailyData[date] = [];
      }
      dailyData[date].push(item);
    });

    return Object.entries(dailyData)
      .slice(0, view === '3day' ? 3 : 5)
      .map(([date, items]) => {
        const minTemp = Math.min(...items.map(item => item.main.temp));
        const maxTemp = Math.max(...items.map(item => item.main.temp));
        const avgHumidity = Math.round(items.reduce((acc, item) => acc + item.main.humidity, 0) / items.length);
        const maxWind = Math.max(...items.map(item => item.wind?.speed || 0));
        const totalPrecip = items.reduce((acc, item) => {
          const rainAmount = (item.rain?.["1h"] || item.rain?.["3h"] || 0);
          const snowAmount = (item.snow?.["1h"] || item.snow?.["3h"] || 0);
          return acc + rainAmount + snowAmount;
        }, 0) / 10; // Convert to cm
        const mostFrequentWeather = items[Math.floor(items.length / 2)].weather[0];

        return (
          <div 
            key={date}
            className="grid grid-cols-7 items-center p-4 rounded-2xl bg-gray-50 dark:bg-gray-800
                       border border-gray-100 dark:border-gray-700 gap-2"
          >
            {/* Date and Icon */}
            <div className="col-span-2 flex items-center gap-3">
              <div className="text-gray-600 dark:text-gray-300">
                {getWeatherIcon(mostFrequentWeather.main, true, "w-12 h-12")}
              </div>
              <div>
                <p className="font-medium text-gray-900 dark:text-white">
                  {new Date(date).toLocaleDateString('en-US', { weekday: 'short' })}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </p>
              </div>
            </div>

            {/* Temperature */}
            <div className="text-center">
              <p className="font-semibold text-gray-900 dark:text-white">
                {Math.round(convertTemp(maxTemp))}°
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {Math.round(convertTemp(minTemp))}°
              </p>
            </div>

            {/* Weather Description */}
            <div className="text-center">
              <p className="text-sm text-gray-900 dark:text-white capitalize">
                {mostFrequentWeather.description}
              </p>
            </div>

            {/* Precipitation */}
            <div className="text-center">
              <p className="text-sm text-gray-900 dark:text-white">
                {totalPrecip > 0 ? `${totalPrecip.toFixed(1)}cm` : "0cm"}
              </p>
            </div>

            {/* Humidity */}
            <div className="text-center">
              <p className="text-sm text-gray-900 dark:text-white">
                {avgHumidity}%
              </p>
            </div>

            {/* Wind */}
            <div className="text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400 flex justify-between">
                <span>Wind</span>
                <span>
                  {items[0].wind?.speed ? (
                    <>
                      {Math.round(maxWind)}m/s {getWindDirection(items[0].wind.deg)}
                    </>
                  ) : 'N/A'}
                </span>
              </p>
            </div>
          </div>
        );
      });
  }, [forecast, view, convertTemp]);

  useEffect(() => {
    let mounted = true;

    async function fetchForecast() {
      if (!city) return;

      try {
        setLoading(true);
        setError(null);
        const data = await getForecastByCity(city.name, city.country);
        if (mounted) {
          setForecast(data);
        }
      } catch (err) {
        if (mounted) {
          setError('Failed to load forecast data');
          console.error('Forecast fetch error:', err);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    fetchForecast();

    return () => {
      mounted = false;
    };
  }, [city]);

  const processHourlyForecast = () => {
    if (!forecast) return [];
    
    const next24Hours = forecast.list.slice(0, 8);
    return next24Hours.map(item => {
      const precipitation = (
        (item.rain?.["1h"] || item.rain?.["3h"] || 0) +
        (item.snow?.["1h"] || item.snow?.["3h"] || 0)
      );
      const precipitationInCm = precipitation / 10;
      
      const hour = new Date(item.dt * 1000).getHours();
      const isDay = hour >= 6 && hour < 18;

      return (
        <div key={item.dt} 
          className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800
                    border border-gray-100 dark:border-gray-700">
          <div className="flex justify-between items-start mb-2">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {new Date(item.dt * 1000).toLocaleTimeString('en-US', { 
                hour: 'numeric',
                minute: '2-digit',
                hour12: true 
              })}
            </p>
            <div className="text-gray-600 dark:text-gray-300">
              {getWeatherIcon(item.weather[0].main, isDay, "w-12 h-12")}
            </div>
          </div>
          
          <p className="text-lg font-medium text-gray-900 dark:text-white mb-3 text-center">
            {item.weather[0].description.charAt(0).toUpperCase() + item.weather[0].description.slice(1)}
          </p>

          <p className="text-xl font-semibold text-gray-900 dark:text-white mb-3 text-center">
            {Math.round(convertTemp(item.main.temp))}°
          </p>

          <div className="space-y-1 text-sm">
            <p className="text-gray-500 dark:text-gray-400 flex justify-between">
              <span>Feels like</span>
              <span>{Math.round(convertTemp(item.main.feels_like))}°</span>
            </p>
            <p className="text-gray-500 dark:text-gray-400 flex justify-between">
              <span>Precip</span>
              <span>
                {precipitation > 0 
                  ? `${precipitationInCm.toFixed(1)}cm` 
                  : "0cm"}
              </span>
            </p>
            <p className="text-gray-500 dark:text-gray-400 flex justify-between">
              <span>Humidity</span>
              <span>{item.main.humidity}%</span>
            </p>
            <p className="text-gray-500 dark:text-gray-400 flex justify-between">
              <span>Wind</span>
              <span>
                {item.wind?.speed ? (
                  <>
                    {Math.round(item.wind.speed)}m/s {getWindDirection(item.wind.deg)}
                  </>
                ) : 'N/A'}
              </span>
            </p>
          </div>
        </div>
      );
    });
  };

  const renderForecast = () => {
    if (!forecast) return null;

    switch (view) {
      case 'hourly':
        return processHourlyForecast();
      case '3day':
      case '5day':
        return (
          <div className="space-y-4">
            {/* Headers */}
            <div className="grid grid-cols-7 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">
              <div className="col-span-2">Date</div>
              <div className="text-center">High/Low</div>
              <div className="text-center">Conditions</div>
              <div className="text-center">Precip</div>
              <div className="text-center">Humidity</div>
              <div className="text-center">Wind</div>
            </div>
            {processDailyForecast}
          </div>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorDisplay message={error} />;
  }

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

ForecastDisplay.displayName = 'ForecastDisplay'; 