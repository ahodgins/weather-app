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

// Constants
const API_BASE_URL = 'https://api.openweathermap.org/data/2.5';
const UNITS = 'metric';

/**
 * Fetches current weather data for a given city
 * @param cityName - Name of the city
 * @param countryCode - Country code of the city
 * @returns Promise containing weather data
 * @throws Error if the API request fails or returns invalid data
 */
export async function getWeatherByCity(cityName: string, countryCode?: string): Promise<WeatherData> {
  const apiKey = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY;
  const baseUrl = process.env.NEXT_PUBLIC_WEATHER_BASE_URL;
  
  // Add country code to query if provided
  const query = countryCode ? `${cityName},${countryCode}` : cityName;
  
  const response = await fetch(
    `${baseUrl}/weather?q=${query}&units=metric&appid=${apiKey}`
  );

  if (!response.ok) {
    throw new Error('Failed to fetch weather data');
  }

  return response.json();
}

/**
 * Fetches forecast data for a given city
 * @param cityName - Name of the city
 * @param countryCode - Country code of the city
 * @returns Promise containing forecast data
 * @throws Error if the API request fails or returns invalid data
 */
export async function getForecastByCity(cityName: string, countryCode?: string): Promise<ForecastData> {
  const apiKey = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY;
  const baseUrl = process.env.NEXT_PUBLIC_WEATHER_BASE_URL;
  
  // Add country code to query if provided
  const query = countryCode ? `${cityName},${countryCode}` : cityName;

  const response = await fetch(
    `${baseUrl}/forecast?q=${query}&units=metric&appid=${apiKey}`
  );

  if (!response.ok) {
    throw new Error('Failed to fetch forecast data');
  }

  return response.json();
} 