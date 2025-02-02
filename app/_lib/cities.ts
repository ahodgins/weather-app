interface City {
  name: string;
  country: string;
  state?: string;
}

// Cache for storing recent queries
const cityCache = new Map<string, City[]>();

export async function getCitySuggestions(query: string): Promise<City[]> {
  const API_KEY = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY;
  
  if (!query.trim() || !API_KEY) return [];

  // Check cache first
  const cacheKey = query.toLowerCase();
  if (cityCache.has(cacheKey)) {
    return cityCache.get(cacheKey)!;
  }

  try {
    const response = await fetch(
      `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(query)}&limit=10&appid=${API_KEY}`,
      { 
        cache: 'no-store',
        headers: {
          'Accept': 'application/json'
        }
      }
    );

    if (!response.ok) return [];

    const data: Array<{
      name: string;
      country: string;
      state?: string;
      lat: number;
      lon: number;
    }> = await response.json();

    const cities = data.map(city => ({
      name: city.name,
      country: city.country,
      state: city.state
    }));

    // Store in cache
    cityCache.set(cacheKey, cities);

    // Clear old cache entries if cache gets too large
    if (cityCache.size > 100) {
      const firstKey = cityCache.keys().next().value;
      cityCache.delete(firstKey);
    }

    return cities;
  } catch (error) {
    console.error('Error fetching city suggestions:', error);
    return [];
  }
} 