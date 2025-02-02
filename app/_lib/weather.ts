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
  name: string;
}

export async function getWeatherByCity(city: string): Promise<WeatherData> {
  const API_KEY = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY;
  const BASE_URL = process.env.NEXT_PUBLIC_WEATHER_BASE_URL;

  if (!API_KEY || !BASE_URL) {
    throw new Error('Weather API configuration is missing');
  }

  const response = await fetch(
    `${BASE_URL}/weather?q=${encodeURIComponent(city)}&units=metric&appid=${API_KEY}`,
    { cache: 'no-store' }
  );

  if (!response.ok) {
    throw new Error('Failed to fetch weather data');
  }

  return response.json();
} 