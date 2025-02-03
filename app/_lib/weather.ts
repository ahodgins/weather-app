import { z } from 'zod';

// Define strict schemas for API responses
const weatherSchema = z.object({
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

const forecastSchema = z.object({
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

// Infer types from schemas
export type WeatherData = z.infer<typeof weatherSchema>;
export type ForecastData = z.infer<typeof forecastSchema>;
export type DailyForecast = z.infer<typeof forecastSchema>['list'][number];

/**
 * Fetches current weather data for a given city
 * @param cityName - Name of the city
 * @param countryCode - Country code of the city
 * @returns Promise containing weather data
 * @throws Error if the API request fails
 */
export async function getWeatherByCity(cityName: string, countryCode?: string): Promise<WeatherData> {
  if (!process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY) {
    throw new Error('OpenWeather API key is not configured');
  }

  const query = countryCode ? `${cityName},${countryCode}` : cityName;
  const params = new URLSearchParams({
    q: query,
    units: 'metric',
    appid: process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY,
  });

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_WEATHER_BASE_URL}/weather?${params}`
    );

    if (!response.ok) {
      throw new Error(`Weather API error: ${response.statusText}`);
    }

    const data = await response.json();
    return weatherSchema.parse(data);
  } catch (error) {
    throw new Error('Failed to fetch weather data');
  }
}

/**
 * Fetches forecast data for a given city
 * @param cityName - Name of the city
 * @param countryCode - Country code of the city
 * @returns Promise containing forecast data
 * @throws Error if the API request fails
 */
export async function getForecastByCity(cityName: string, countryCode?: string): Promise<ForecastData> {
  if (!process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY) {
    throw new Error('OpenWeather API key is not configured');
  }

  const query = countryCode ? `${cityName},${countryCode}` : cityName;
  const params = new URLSearchParams({
    q: query,
    units: 'metric',
    appid: process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY,
  });

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_WEATHER_BASE_URL}/forecast?${params}`
    );

    if (!response.ok) {
      throw new Error(`Forecast API error: ${response.statusText}`);
    }

    const data = await response.json();
    return forecastSchema.parse(data);
  } catch (error) {
    throw new Error('Failed to fetch forecast data');
  }
} 