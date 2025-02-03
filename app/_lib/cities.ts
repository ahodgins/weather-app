export async function getCitySuggestions(input: string) {
  if (!process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY) {
    throw new Error('OpenWeather API key is not configured');
  }

  try {
    const params = new URLSearchParams({
      q: input,
      limit: '5',
      appid: process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY,
    });

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_GEO_BASE_URL}/direct?${params}`
    );

    if (!response.ok) {
      throw new Error('Failed to fetch city suggestions');
    }

    const data = await response.json();
    return data;
  } catch {
    return []; // Return empty array on error
  }
} 