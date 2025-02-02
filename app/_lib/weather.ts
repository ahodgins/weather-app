interface WeatherData {
  main: {
    temp: number;
    feels_like: number;
    humidity: number;
    pressure: number;
  };
  weather: Array<{
    description: string;
    icon: string;
    main: string;
  }>;
  rain?: {
    "1h"?: number;  // Rain volume for last hour
    "3h"?: number;  // Rain volume for last 3 hours
  };
  name: string;
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
  city: {
    name: string;
    country: string;
  };
}

class WeatherApiError extends Error {
  status?: number;
  
  constructor(message: string, status?: number) {
    super(message);
    // Restore prototype chain
    Object.setPrototypeOf(this, WeatherApiError.prototype);
    
    this.name = 'WeatherApiError';
    this.status = status;
  }
}

export async function getWeatherByCity(city: string): Promise<WeatherData> {
  const API_KEY = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY;
  const BASE_URL = process.env.NEXT_PUBLIC_WEATHER_BASE_URL;

  if (!API_KEY || !BASE_URL) {
    throw new WeatherApiError('Weather API configuration is missing');
  }

  try {
    const response = await fetch(
      `${BASE_URL}/weather?q=${encodeURIComponent(city)}&units=metric&appid=${API_KEY}`,
      { cache: 'no-store' }
    );

    if (!response.ok) {
      throw new WeatherApiError(
        `Failed to fetch weather data: ${response.statusText || 'Unknown error'}`,
        response.status
      );
    }

    return response.json();
  } catch (error) {
    if (error instanceof WeatherApiError) {
      throw error;
    }
    throw new WeatherApiError('Failed to fetch weather data');
  }
}

export async function getForecastByCity(city: string): Promise<ForecastData> {
  const API_KEY = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY;
  const BASE_URL = process.env.NEXT_PUBLIC_WEATHER_BASE_URL;

  if (!API_KEY || !BASE_URL) {
    throw new WeatherApiError('Weather API configuration is missing');
  }

  try {
    const response = await fetch(
      `${BASE_URL}/forecast?q=${encodeURIComponent(city)}&units=metric&appid=${API_KEY}`,
      { cache: 'no-store' }
    );

    if (!response.ok) {
      throw new WeatherApiError(
        `Failed to fetch forecast data: ${response.statusText || 'Unknown error'}`,
        response.status
      );
    }

    return response.json();
  } catch (error) {
    if (error instanceof WeatherApiError) {
      throw error;
    }
    throw new WeatherApiError('Failed to fetch forecast data');
  }
} 