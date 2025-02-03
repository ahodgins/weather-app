import { z } from 'zod';

// Define strict schemas for API responses
const WeatherSchema = z.object({
  name: z.string(),
  main: z.object({
    temp: z.number(),
    feels_like: z.number(),
    humidity: z.number(),
    pressure: z.number(),
  }),
  weather: z.array(z.object({
    id: z.number(),
    main: z.string(),
    description: z.string(),
    icon: z.string(),
  })),
  wind: z.object({
    speed: z.number(),
    deg: z.number(),
  }).optional(),
  visibility: z.number().optional(),
  sys: z.object({
    sunrise: z.number(),
    sunset: z.number(),
  }),
  rain: z.object({
    "1h": z.number().optional(),
    "3h": z.number().optional(),
  }).optional(),
});

const ForecastSchema = z.object({
  list: z.array(z.object({
    dt: z.number(),
    main: z.object({
      temp: z.number(),
      feels_like: z.number(),
      humidity: z.number(),
      pressure: z.number(),
    }),
    weather: z.array(z.object({
      id: z.number(),
      main: z.string(),
      description: z.string(),
      icon: z.string(),
    })),
    wind: z.object({
      speed: z.number(),
      deg: z.number(),
    }).optional(),
    rain: z.object({
      "1h": z.number().optional(),
      "3h": z.number().optional(),
    }).optional(),
    snow: z.object({
      "1h": z.number().optional(),
      "3h": z.number().optional(),
    }).optional(),
    dt_txt: z.string(),
  })),
  city: z.object({
    name: z.string(),
    country: z.string(),
  }),
});

export type WeatherData = z.infer<typeof WeatherSchema>;
export type ForecastData = z.infer<typeof ForecastSchema>;
export type DailyForecast = z.infer<typeof ForecastSchema>['list'][number];

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

// Constants
const API_BASE_URL = 'https://api.openweathermap.org/data/2.5';
const UNITS = 'metric';

/**
 * Fetches current weather data for a given city
 * @param city - Name of the city
 * @returns Promise containing weather data
 * @throws Error if the API request fails or returns invalid data
 */
export async function getWeatherByCity(city: string): Promise<WeatherData> {
  if (!process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY) {
    throw new Error('OpenWeather API key is not configured');
  }

  const params = new URLSearchParams({
    q: city,
    units: UNITS,
    appid: process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY,
  });

  try {
    const response = await fetch(`${API_BASE_URL}/weather?${params}`);
    
    if (!response.ok) {
      throw new Error(`Weather API error: ${response.statusText}`);
    }

    const data = await response.json();
    return WeatherSchema.parse(data);
  } catch (error) {
    console.error('Failed to fetch weather data:', error);
    throw new Error('Failed to fetch weather data');
  }
}

/**
 * Fetches forecast data for a given city
 * @param city - Name of the city
 * @returns Promise containing forecast data
 * @throws Error if the API request fails or returns invalid data
 */
export async function getForecastByCity(city: string): Promise<ForecastData> {
  if (!process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY) {
    throw new Error('OpenWeather API key is not configured');
  }

  const params = new URLSearchParams({
    q: city,
    units: UNITS,
    appid: process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY,
  });

  try {
    const response = await fetch(`${API_BASE_URL}/forecast?${params}`);
    
    if (!response.ok) {
      throw new Error(`Forecast API error: ${response.statusText}`);
    }

    const data = await response.json();
    return ForecastSchema.parse(data);
  } catch (error) {
    console.error('Failed to fetch forecast data:', error);
    throw new Error('Failed to fetch forecast data');
  }
} 