import type { SavedCitySummary, TemperatureUnit, ThemeMode, WindSpeedUnit } from '../types/weather';

const STORAGE_KEYS = {
  SAVED_CITIES: 'weatherwise_saved_cities_v1',
  TEMP_UNIT: 'weatherwise_temp_unit_v1',
  WIND_UNIT: 'weatherwise_wind_unit_v1',
  THEME: 'weatherwise_theme_v1',
  LAST_CITY: 'weatherwise_last_city_v1',
} as const;

export const storageService = {
  getSavedCities(): SavedCitySummary[] {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEYS.SAVED_CITIES);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  },

  setSavedCities(cities: SavedCitySummary[]): void {
    try {
      window.localStorage.setItem(STORAGE_KEYS.SAVED_CITIES, JSON.stringify(cities));
    } catch {
      // Ignore storage quota errors
    }
  },

  getTempUnit(): TemperatureUnit {
    try {
      const val = window.localStorage.getItem(STORAGE_KEYS.TEMP_UNIT);
      return val === 'F' ? 'F' : 'C';
    } catch {
      return 'C';
    }
  },

  setTempUnit(unit: TemperatureUnit): void {
    try {
      window.localStorage.setItem(STORAGE_KEYS.TEMP_UNIT, unit);
    } catch {
      // Ignore
    }
  },

  getWindUnit(): WindSpeedUnit {
    try {
      const val = window.localStorage.getItem(STORAGE_KEYS.WIND_UNIT);
      if (val === 'm/s' || val === 'mph') return val;
      return 'km/h';
    } catch {
      return 'km/h';
    }
  },

  setWindUnit(unit: WindSpeedUnit): void {
    try {
      window.localStorage.setItem(STORAGE_KEYS.WIND_UNIT, unit);
    } catch {
      // Ignore
    }
  },

  getTheme(): ThemeMode {
    try {
      const val = window.localStorage.getItem(STORAGE_KEYS.THEME);
      if (val === 'dark' || val === 'light') return val;
      return 'light';
    } catch {
      return 'light';
    }
  },

  setTheme(theme: ThemeMode): void {
    try {
      window.localStorage.setItem(STORAGE_KEYS.THEME, theme);
    } catch {
      // Ignore
    }
  },

  getLastCity(): string | null {
    try {
      return window.localStorage.getItem(STORAGE_KEYS.LAST_CITY);
    } catch {
      return null;
    }
  },

  setLastCity(city: string): void {
    try {
      window.localStorage.setItem(STORAGE_KEYS.LAST_CITY, city);
    } catch {
      // Ignore
    }
  },

  clearAll(): void {
    try {
      Object.values(STORAGE_KEYS).forEach((key) => window.localStorage.removeItem(key));
    } catch {
      // Ignore
    }
  },
};
