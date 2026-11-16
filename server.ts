import 'dotenv/config';
import express, { type Request, type Response } from 'express';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

type WeatherCondition =
  | 'sunny'
  | 'partly-cloudy'
  | 'cloudy'
  | 'rain'
  | 'storm'
  | 'snow'
  | 'fog';

interface HourlyForecastItem {
  time: string;
  hourLabel: string;
  tempC: number;
  condition: WeatherCondition;
  conditionText: string;
  precipitationProbability: number;
}

interface ForecastDay {
  date: string;
  dayLabel: string;
  shortDate: string;
  tempMinC: number;
  tempMaxC: number;
  condition: WeatherCondition;
  conditionText: string;
  precipitationProbability: number;
  windSpeedKmh: number;
}

interface WeatherData {
  city: string;
  region: string;
  country: string;
  latitude: number;
  longitude: number;
  timezone: string;
  observationTime: string;
  isDay: boolean;
  tempC: number;
  feelsLikeC: number;
  tempMinC: number;
  tempMaxC: number;
  humidity: number;
  windSpeedKmh: number;
  pressureHpa: number;
  visibilityKm: number;
  uvIndex: number;
  condition: WeatherCondition;
  conditionText: string;
  source: 'openweathermap' | 'open-meteo';
  forecast: ForecastDay[];
  hourly: HourlyForecastItem[];
}

function mapWmoCode(code: number): { condition: WeatherCondition; text: string } {
  if (code === 0) return { condition: 'sunny', text: 'Clear Sky' };
  if (code === 1) return { condition: 'sunny', text: 'Mainly Clear' };
  if (code === 2) return { condition: 'partly-cloudy', text: 'Partly Cloudy' };
  if (code === 3) return { condition: 'cloudy', text: 'Overcast' };
  if (code === 45 || code === 48) return { condition: 'fog', text: 'Fog & Mist' };
  if ([51, 53, 55, 56, 57].includes(code)) return { condition: 'rain', text: 'Drizzle' };
  if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return { condition: 'rain', text: 'Rain Showers' };
  if ([71, 73, 75, 77, 85, 86].includes(code)) return { condition: 'snow', text: 'Snowfall' };
  if ([95, 96, 99].includes(code)) return { condition: 'storm', text: 'Thunderstorm' };
  return { condition: 'partly-cloudy', text: 'Partly Cloudy' };
}

function mapOwmCode(id: number): WeatherCondition {
  if (id >= 200 && id < 300) return 'storm';
  if (id >= 300 && id < 600) return 'rain';
  if (id >= 600 && id < 700) return 'snow';
  if (id >= 700 && id < 800) return 'fog';
  if (id === 800) return 'sunny';
  if (id === 801 || id === 802) return 'partly-cloudy';
  return 'cloudy';
}

function formatDayLabel(dateStr: string, index: number): string {
  if (index === 0) return 'Today';
  if (index === 1) return 'Tomorrow';
  const date = new Date(`${dateStr}T12:00:00Z`);
  return date.toLocaleDateString('en-US', { weekday: 'long', timeZone: 'UTC' });
}

function formatShortDate(dateStr: string): string {
  const date = new Date(`${dateStr}T12:00:00Z`);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' });
}

function formatHourLabel(isoTime: string): string {
  const parts = isoTime.split('T');
  if (parts.length < 2) return isoTime;
  const [hourStr] = parts[1].split(':');
  const hour = Number.parseInt(hourStr, 10);
  if (Number.isNaN(hour)) return parts[1];
  if (hour === 0) return '12 AM';
  if (hour === 12) return '12 PM';
  return hour > 12 ? `${hour - 12} PM` : `${hour} AM`;
}

async function fetchWithTimeout(url: string, timeoutMs = 8000): Promise<globalThis.Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

async function fetchFromOpenWeatherMap(cityQuery: string, apiKey: string): Promise<WeatherData> {
  const encodedCity = encodeURIComponent(cityQuery);
  const [currentRes, forecastRes] = await Promise.all([
    fetchWithTimeout(`https://api.openweathermap.org/data/2.5/weather?q=${encodedCity}&units=metric&appid=${apiKey}`),
    fetchWithTimeout(`https://api.openweathermap.org/data/2.5/forecast?q=${encodedCity}&units=metric&appid=${apiKey}`),
  ]);

  if (currentRes.status === 404) {
    const err = new Error(`City "${cityQuery}" was not found. Please check the spelling and try again.`);
    (err as Error & { statusCode?: number }).statusCode = 404;
    throw err;
  }

  if (!currentRes.ok || !forecastRes.ok) {
    const err = new Error('Unable to reach OpenWeatherMap service right now. Please try again.');
    (err as Error & { statusCode?: number }).statusCode = 502;
    throw err;
  }

  const current = await currentRes.json();
  const forecastJson = await forecastRes.json();

  const weatherMeta = current.weather?.[0] ?? { id: 800, description: 'Clear sky' };
  const condition = mapOwmCode(weatherMeta.id);
  const conditionText = String(weatherMeta.description || 'Clear')
    .split(' ')
    .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');

  const isDay =
    typeof current.dt === 'number' &&
    typeof current.sys?.sunrise === 'number' &&
    typeof current.sys?.sunset === 'number'
      ? current.dt >= current.sys.sunrise && current.dt < current.sys.sunset
      : true;

  const groupedDays = new Map<string, typeof forecastJson.list>();
  for (const item of forecastJson.list ?? []) {
    const dateKey = String(item.dt_txt).split(' ')[0];
    const existing = groupedDays.get(dateKey) ?? [];
    existing.push(item);
    groupedDays.set(dateKey, existing);
  }

  const forecast: ForecastDay[] = Array.from(groupedDays.entries())
    .slice(0, 5)
    .map(([date, entries], idx) => {
      const tempsMin = entries.map((e: { main: { temp_min: number } }) => e.main.temp_min);
      const tempsMax = entries.map((e: { main: { temp_max: number } }) => e.main.temp_max);
      const midEntry = entries[Math.floor(entries.length / 2)] ?? entries[0];
      const entryMeta = midEntry.weather?.[0] ?? { id: 800, main: 'Clear' };
      const maxPop = Math.max(...entries.map((e: { pop?: number }) => Math.round((e.pop ?? 0) * 100)));
      const maxWind = Math.max(...entries.map((e: { wind?: { speed?: number } }) => (e.wind?.speed ?? 0) * 3.6));

      return {
        date,
        dayLabel: formatDayLabel(date, idx),
        shortDate: formatShortDate(date),
        tempMinC: Math.round(Math.min(...tempsMin) * 10) / 10,
        tempMaxC: Math.round(Math.max(...tempsMax) * 10) / 10,
        condition: mapOwmCode(entryMeta.id),
        conditionText: String(entryMeta.main || 'Clear'),
        precipitationProbability: maxPop,
        windSpeedKmh: Math.round(maxWind * 10) / 10,
      };
    });

  const hourly: HourlyForecastItem[] = (forecastJson.list ?? []).slice(0, 8).map(
    (item: { dt_txt: string; main: { temp: number }; weather?: Array<{ id: number; main: string }>; pop?: number }) => {
      const iso = item.dt_txt.replace(' ', 'T');
      const meta = item.weather?.[0] ?? { id: 800, main: 'Clear' };
      return {
        time: iso,
        hourLabel: formatHourLabel(iso),
        tempC: Math.round(item.main.temp * 10) / 10,
        condition: mapOwmCode(meta.id),
        conditionText: meta.main,
        precipitationProbability: Math.round((item.pop ?? 0) * 100),
      };
    }
  );

  return {
    city: current.name,
    region: '',
    country: current.sys?.country ?? '',
    latitude: current.coord?.lat ?? 0,
    longitude: current.coord?.lon ?? 0,
    timezone: 'UTC',
    observationTime: new Date((current.dt ?? Math.floor(Date.now() / 1000)) * 1000).toISOString(),
    isDay,
    tempC: Math.round(current.main.temp * 10) / 10,
    feelsLikeC: Math.round(current.main.feels_like * 10) / 10,
    tempMinC: Math.round((forecast[0]?.tempMinC ?? current.main.temp_min) * 10) / 10,
    tempMaxC: Math.round((forecast[0]?.tempMaxC ?? current.main.temp_max) * 10) / 10,
    humidity: current.main.humidity,
    windSpeedKmh: Math.round((current.wind?.speed ?? 0) * 3.6 * 10) / 10,
    pressureHpa: current.main.pressure,
    visibilityKm: Math.round(((current.visibility ?? 10000) / 1000) * 10) / 10,
    uvIndex: 0,
    condition,
    conditionText,
    source: 'openweathermap',
    forecast,
    hourly,
  };
}

async function fetchFromOpenMeteo(cityQuery: string): Promise<WeatherData> {
  const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cityQuery)}&count=1&language=en&format=json`;
  const geoRes = await fetchWithTimeout(geoUrl);

  if (!geoRes.ok) {
    const err = new Error('Weather location service is temporarily unavailable. Please try again.');
    (err as Error & { statusCode?: number }).statusCode = 502;
    throw err;
  }

  const geoData = await geoRes.json();
  const place = geoData.results?.[0];

  if (!place) {
    const err = new Error(`City "${cityQuery}" was not found. Please check the spelling and try again.`);
    (err as Error & { statusCode?: number }).statusCode = 404;
    throw err;
  }

  const weatherUrl =
    `https://api.open-meteo.com/v1/forecast` +
    `?latitude=${place.latitude}&longitude=${place.longitude}` +
    `&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,weather_code,surface_pressure,wind_speed_10m,visibility` +
    `&hourly=temperature_2m,weather_code,precipitation_probability` +
    `&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,wind_speed_10m_max,uv_index_max` +
    `&timezone=auto&forecast_days=6`;

  const weatherRes = await fetchWithTimeout(weatherUrl);
  if (!weatherRes.ok) {
    const err = new Error('Unable to fetch forecast data right now. Please retry.');
    (err as Error & { statusCode?: number }).statusCode = 502;
    throw err;
  }

  const data = await weatherRes.json();
  const current = data.current;
  const daily = data.daily;
  const hourlyRaw = data.hourly;

  const currentMapped = mapWmoCode(current.weather_code);

  const forecast: ForecastDay[] = (daily.time as string[]).slice(0, 5).map((dateStr, idx) => {
    const mapped = mapWmoCode(daily.weather_code[idx]);
    return {
      date: dateStr,
      dayLabel: formatDayLabel(dateStr, idx),
      shortDate: formatShortDate(dateStr),
      tempMinC: Math.round(daily.temperature_2m_min[idx] * 10) / 10,
      tempMaxC: Math.round(daily.temperature_2m_max[idx] * 10) / 10,
      condition: mapped.condition,
      conditionText: mapped.text,
      precipitationProbability: daily.precipitation_probability_max?.[idx] ?? 0,
      windSpeedKmh: Math.round((daily.wind_speed_10m_max?.[idx] ?? 0) * 10) / 10,
    };
  });

  const currentHourPrefix = String(current.time).slice(0, 13);
  let startIndex = (hourlyRaw.time as string[]).findIndex((t) => t.startsWith(currentHourPrefix));
  if (startIndex < 0) startIndex = 0;

  const hourly: HourlyForecastItem[] = (hourlyRaw.time as string[])
    .slice(startIndex, startIndex + 12)
    .map((timeStr, offset) => {
      const idx = startIndex + offset;
      const mapped = mapWmoCode(hourlyRaw.weather_code[idx]);
      return {
        time: timeStr,
        hourLabel: offset === 0 ? 'Now' : formatHourLabel(timeStr),
        tempC: Math.round(hourlyRaw.temperature_2m[idx] * 10) / 10,
        condition: mapped.condition,
        conditionText: mapped.text,
        precipitationProbability: hourlyRaw.precipitation_probability?.[idx] ?? 0,
      };
    });

  return {
    city: place.name,
    region: place.admin1 ?? '',
    country: place.country ?? place.country_code ?? '',
    latitude: place.latitude,
    longitude: place.longitude,
    timezone: data.timezone ?? 'auto',
    observationTime: current.time,
    isDay: current.is_day === 1,
    tempC: Math.round(current.temperature_2m * 10) / 10,
    feelsLikeC: Math.round(current.apparent_temperature * 10) / 10,
    tempMinC: forecast[0]?.tempMinC ?? Math.round(current.temperature_2m * 10) / 10,
    tempMaxC: forecast[0]?.tempMaxC ?? Math.round(current.temperature_2m * 10) / 10,
    humidity: Math.round(current.relative_humidity_2m),
    windSpeedKmh: Math.round(current.wind_speed_10m * 10) / 10,
    pressureHpa: Math.round(current.surface_pressure),
    visibilityKm: Math.round(((current.visibility ?? 10000) / 1000) * 10) / 10,
    uvIndex: Math.round((daily.uv_index_max?.[0] ?? 0) * 10) / 10,
    condition: currentMapped.condition,
    conditionText: currentMapped.text,
    source: 'open-meteo',
    forecast,
    hourly,
  };
}

async function resolveCityWeather(cityQuery: string): Promise<WeatherData> {
  const openWeatherKey = process.env.OPENWEATHER_API_KEY?.trim();
  if (openWeatherKey) {
    try {
      return await fetchFromOpenWeatherMap(cityQuery, openWeatherKey);
    } catch (err) {
      const status = (err as Error & { statusCode?: number }).statusCode;
      if (status === 404) throw err;
      // Fallback to Open-Meteo if OpenWeatherMap key is invalid or rate-limited
    }
  }
  return fetchFromOpenMeteo(cityQuery);
}

async function startServer(): Promise<void> {
  const app = express();
  app.use(express.json());

  app.get('/api/weather', async (req: Request, res: Response) => {
    const rawCity = typeof req.query.city === 'string' ? req.query.city.trim() : '';

    if (!rawCity) {
      res.status(400).json({ error: 'Please enter a city name before searching.' });
      return;
    }

    if (rawCity.length < 2 || !/[a-zA-Z\u00C0-\u024F]/.test(rawCity)) {
      res.status(400).json({ error: 'Please enter a valid city name (at least 2 letters).' });
      return;
    }

    try {
      const weather = await resolveCityWeather(rawCity);
      res.json(weather);
    } catch (err) {
      const status = (err as Error & { statusCode?: number }).statusCode ?? 503;
      const message =
        err instanceof Error && err.name === 'AbortError'
          ? 'The weather service timed out. Please check your connection and retry.'
          : err instanceof Error
            ? err.message
            : 'Failed to fetch weather data. Please retry.';
      res.status(status).json({ error: message });
    }
  });

  app.get('/api/weather/suggestions', async (req: Request, res: Response) => {
    const query = typeof req.query.q === 'string' ? req.query.q.trim() : '';
    if (query.length < 2) {
      res.json({ suggestions: [] });
      return;
    }

    try {
      const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=5&language=en&format=json`;
      const response = await fetchWithTimeout(geoUrl, 5000);
      if (!response.ok) {
        res.json({ suggestions: [] });
        return;
      }
      const data = await response.json();
      const suggestions = (data.results ?? []).map(
        (r: { name: string; admin1?: string; country?: string; country_code?: string; latitude: number; longitude: number }) => ({
          name: r.name,
          region: r.admin1 ?? '',
          country: r.country ?? r.country_code ?? '',
          latitude: r.latitude,
          longitude: r.longitude,
        })
      );
      res.json({ suggestions });
    } catch {
      res.json({ suggestions: [] });
    }
  });

  app.get('/api/weather/batch', async (req: Request, res: Response) => {
    const rawCities = typeof req.query.cities === 'string' ? req.query.cities : '';
    const cityList = rawCities
      .split(',')
      .map((c) => c.trim())
      .filter(Boolean)
      .slice(0, 12);

    if (cityList.length === 0) {
      res.json({ items: [] });
      return;
    }

    const results = await Promise.allSettled(cityList.map((city) => resolveCityWeather(city)));
    const items = results
      .filter((r): r is PromiseFulfilledResult<WeatherData> => r.status === 'fulfilled')
      .map(({ value }) => ({
        city: value.city,
        region: value.region,
        country: value.country,
        tempC: value.tempC,
        tempMinC: value.tempMinC,
        tempMaxC: value.tempMaxC,
        humidity: value.humidity,
        windSpeedKmh: value.windSpeedKmh,
        isDay: value.isDay,
        condition: value.condition,
        conditionText: value.conditionText,
        updatedAt: value.observationTime,
      }));

    res.json({ items });
  });

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(__dirname, 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      const indexFile = path.join(distDir, 'index.html');
      if (fs.existsSync(indexFile)) {
        res.sendFile(indexFile);
      } else {
        res.status(404).send('Build output not found.');
      }
    });
  }

  const port = Number.parseInt(process.env.PORT ?? '3000', 10);
  app.listen(port, '0.0.0.0', () => {
    console.log(`WeatherWise server running at http://0.0.0.0:${port}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start WeatherWise server:', err);
  process.exit(1);
});
