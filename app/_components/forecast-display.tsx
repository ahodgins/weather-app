'use client';

import { useEffect, useState } from 'react';
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

interface ForecastDisplayProps {
  city: string;
  view: 'hourly' | '3day' | '5day';
}

function getWindDirection(degrees: number): string {
  const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE',
                     'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  const index = Math.round(((degrees % 360) / 22.5));
  return directions[index % 16];
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
              {getWeatherIcon(item.weather[0].main, isDay, "md")}
            </div>
          </div>
          
          <p className="text-lg font-medium text-gray-900 dark:text-white mb-3 text-center">
            {item.weather[0].description.charAt(0).toUpperCase() + item.weather[0].description.slice(1)}
          </p>

          <p className="text-xl font-semibold text-gray-900 dark:text-white mb-3 text-center">
            {Math.round(convertTemp(item.main.temp))}°{unit}
          </p>

          <div className="space-y-1 text-sm">
            <p className="text-gray-500 dark:text-gray-400 flex justify-between">
              <span>Feels like</span>
              <span>{Math.round(convertTemp(item.main.feels_like))}°{unit}</span>
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
              <span>{Math.round(item.wind.speed)}m/s {getWindDirection(item.wind.deg)}</span>
            </p>
          </div>
        </div>
      );
    });
  };

  const processDailyForecast = (days: number) => {
    const dailyData: { [key: string]: DailyForecast[] } = {};
    
    forecast.list.forEach(item => {
      const date = new Date(item.dt * 1000).toLocaleDateString();
      if (!dailyData[date]) {
        dailyData[date] = [];
      }
      dailyData[date].push(item);
    });

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

        {/* Daily Rows */}
        {Object.entries(dailyData)
          .slice(0, days)
          .map(([date, items]) => {
            const minTemp = Math.min(...items.map(item => item.main.temp));
            const maxTemp = Math.max(...items.map(item => item.main.temp));
            const avgHumidity = Math.round(items.reduce((acc, item) => acc + item.main.humidity, 0) / items.length);
            const maxWind = Math.max(...items.map(item => item.wind.speed));
            const totalPrecip = items.reduce((acc, item) => {
              const rainAmount = (item.rain?.["1h"] || item.rain?.["3h"] || 0);
              const snowAmount = (item.snow?.["1h"] || item.snow?.["3h"] || 0);
              return acc + rainAmount + snowAmount;
            }, 0) / 10;
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
                    {getWeatherIcon(mostFrequentWeather.main, true, "sm")}
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
                  <p className="text-sm text-gray-900 dark:text-white">
                    {Math.round(maxWind)}m/s
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {getWindDirection(items[0].wind.deg)}
                  </p>
                </div>
              </div>
            );
          })}
      </div>
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