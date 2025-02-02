interface City {
  name: string;
  country: string;
  state?: string;
}

// Cache for storing recent queries
const cityCache = new Map<string, City[]>();

export async function getCitySuggestions(query: string): Promise<City[]> {
  const API_KEY = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY;
  const GEO_URL = process.env.NEXT_PUBLIC_GEO_BASE_URL;
  
  if (!query.trim() || !API_KEY || !GEO_URL) {
    console.error('Missing API configuration');
    return [];
  }

  // Check cache first
  const cacheKey = query.toLowerCase();
  if (cityCache.has(cacheKey)) {
    return cityCache.get(cacheKey)!;
  }

  try {
    console.log('Fetching cities for:', query);
    const response = await fetch(
      `${GEO_URL}/direct?q=${encodeURIComponent(query)}&limit=10&appid=${API_KEY}`,
      { 
        cache: 'no-store',
        headers: {
          'Accept': 'application/json'
        }
      }
    );

    if (!response.ok) {
      console.error('City API error:', response.status, response.statusText);
      return [];
    }

    const data = await response.json();
    console.log('City data received:', data); // Debug log

    const cities = data.map((city: any) => ({
      name: city.name,
      country: city.country,
      state: city.state
    }));

    cityCache.set(cacheKey, cities);

    // Clear old cache entries if cache gets too large
    if (cityCache.size > 100) {
      const firstKey = cityCache.keys().next().value;
      if (firstKey) {
        cityCache.delete(firstKey);
      }
    }

    return cities;
  } catch (error) {
    console.error('Error fetching city suggestions:', error);
    return [];
  }
} 