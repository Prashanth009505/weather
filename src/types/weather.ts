export type WeatherCondition =
  | 'sunny'
  | 'partly-cloudy'
  | 'cloudy'
  | 'rain'
  | 'storm'
  | 'snow'
  | 'fog';

export type TemperatureUnit = 'C' | 'F';
export type WindSpeedUnit = 'km/h' | 'm/s' | 'mph';
export type ThemeMode = 'light' | 'dark';
export type ScreenTab = 'home' | 'details' | 'saved' | 'settings';

export interface HourlyForecastItem {
  time: string;
  hourLabel: string;
  tempC: number;
  condition: WeatherCondition;
  conditionText: string;
  precipitationProbability: number;
}

export interface ForecastDay {
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

export interface WeatherData {
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

export interface SavedCitySummary {
  city: string;
  region: string;
  country: string;
  tempC: number;
  tempMinC: number;
  tempMaxC: number;
  humidity: number;
  windSpeedKmh: number;
  isDay: boolean;
  condition: WeatherCondition;
  conditionText: string;
  updatedAt: string;
}

export interface CitySuggestion {
  name: string;
  region: string;
  country: string;
  latitude: number;
  longitude: number;
}
