import type { CitySuggestion, SavedCitySummary, WeatherData } from '../types/weather';

export async function fetchWeatherByCity(
  city: string,
  signal?: AbortSignal
): Promise<WeatherData> {
  const res = await fetch(`/api/weather?city=${encodeURIComponent(city)}`, { signal });
  const payload = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(
      typeof payload.error === 'string' && payload.error.trim()
        ? payload.error
        : 'Unable to load weather information. Please check your connection and retry.'
    );
  }

  return payload as WeatherData;
}

export async function fetchCitySuggestions(
  query: string,
  signal?: AbortSignal
): Promise<CitySuggestion[]> {
  if (query.trim().length < 2) return [];
  try {
    const res = await fetch(`/api/weather/suggestions?q=${encodeURIComponent(query.trim())}`, {
      signal,
    });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data.suggestions) ? data.suggestions : [];
  } catch {
    return [];
  }
}

export async function fetchBatchSavedCities(
  cities: string[],
  signal?: AbortSignal
): Promise<SavedCitySummary[]> {
  if (cities.length === 0) return [];
  const res = await fetch(
    `/api/weather/batch?cities=${encodeURIComponent(cities.join(','))}`,
    { signal }
  );
  if (!res.ok) {
    throw new Error('Failed to refresh saved cities weather.');
  }
  const data = await res.json();
  return Array.isArray(data.items) ? data.items : [];
}
