import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { storageService } from '../services/storageService';
import { fetchBatchSavedCities, fetchWeatherByCity } from '../services/weatherService';
import type {
  SavedCitySummary,
  ScreenTab,
  TemperatureUnit,
  ThemeMode,
  WeatherData,
  WindSpeedUnit,
} from '../types/weather';

interface WeatherContextValue {
  activeTab: ScreenTab;
  setActiveTab: (tab: ScreenTab) => void;
  currentWeather: WeatherData | null;
  lastSearchedCity: string;
  isLoading: boolean;
  isRefreshingSaved: boolean;
  error: string | null;
  savedCities: SavedCitySummary[];
  tempUnit: TemperatureUnit;
  windUnit: WindSpeedUnit;
  theme: ThemeMode;
  searchCity: (city: string, navigateToDetails?: boolean) => Promise<void>;
  retryLastSearch: () => Promise<void>;
  isCitySaved: (cityName: string, country?: string) => boolean;
  toggleSaveCurrentCity: () => void;
  removeSavedCity: (cityName: string, country?: string) => void;
  openSavedCityDetails: (city: SavedCitySummary) => Promise<void>;
  refreshSavedCities: () => Promise<void>;
  setTempUnit: (unit: TemperatureUnit) => void;
  setWindUnit: (unit: WindSpeedUnit) => void;
  setTheme: (theme: ThemeMode) => void;
  resetAllPreferences: () => void;
}

const WeatherContext = createContext<WeatherContextValue | null>(null);

function toSavedSummary(weather: WeatherData): SavedCitySummary {
  return {
    city: weather.city,
    region: weather.region,
    country: weather.country,
    tempC: weather.tempC,
    tempMinC: weather.tempMinC,
    tempMaxC: weather.tempMaxC,
    humidity: weather.humidity,
    windSpeedKmh: weather.windSpeedKmh,
    isDay: weather.isDay,
    condition: weather.condition,
    conditionText: weather.conditionText,
    updatedAt: weather.observationTime,
  };
}

export function WeatherProvider({ children }: { children: React.ReactNode }) {
  const [activeTab, setActiveTab] = useState<ScreenTab>('home');
  const [currentWeather, setCurrentWeather] = useState<WeatherData | null>(null);
  const [lastSearchedCity, setLastSearchedCity] = useState<string>(
    () => storageService.getLastCity() || 'London'
  );
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isRefreshingSaved, setIsRefreshingSaved] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [savedCities, setSavedCities] = useState<SavedCitySummary[]>(() =>
    storageService.getSavedCities()
  );
  const [tempUnit, setTempUnitState] = useState<TemperatureUnit>(() =>
    storageService.getTempUnit()
  );
  const [windUnit, setWindUnitState] = useState<WindSpeedUnit>(() =>
    storageService.getWindUnit()
  );
  const [theme, setThemeState] = useState<ThemeMode>(() => storageService.getTheme());

  const abortControllerRef = useRef<AbortController | null>(null);
  const inFlightQueryRef = useRef<string | null>(null);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    storageService.setTheme(theme);
  }, [theme]);

  const setTempUnit = useCallback((unit: TemperatureUnit) => {
    setTempUnitState(unit);
    storageService.setTempUnit(unit);
  }, []);

  const setWindUnit = useCallback((unit: WindSpeedUnit) => {
    setWindUnitState(unit);
    storageService.setWindUnit(unit);
  }, []);

  const setTheme = useCallback((nextTheme: ThemeMode) => {
    setThemeState(nextTheme);
    storageService.setTheme(nextTheme);
  }, []);

  const syncSavedSummary = useCallback((weather: WeatherData) => {
    setSavedCities((prev) => {
      const idx = prev.findIndex(
        (item) =>
          item.city.toLowerCase() === weather.city.toLowerCase() &&
          item.country.toLowerCase() === weather.country.toLowerCase()
      );
      if (idx === -1) return prev;
      const next = [...prev];
      next[idx] = toSavedSummary(weather);
      storageService.setSavedCities(next);
      return next;
    });
  }, []);

  const searchCity = useCallback(
    async (rawCity: string, navigateToDetails = false) => {
      const cleaned = rawCity.trim();
      if (!cleaned) return;

      // Prevent duplicate concurrent requests for the exact same query on rapid taps
      if (isLoading && inFlightQueryRef.current?.toLowerCase() === cleaned.toLowerCase()) {
        return;
      }

      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      const controller = new AbortController();
      abortControllerRef.current = controller;
      inFlightQueryRef.current = cleaned;

      setLastSearchedCity(cleaned);
      setIsLoading(true);
      setError(null);

      try {
        const data = await fetchWeatherByCity(cleaned, controller.signal);
        setCurrentWeather(data);
        setLastSearchedCity(data.city);
        storageService.setLastCity(data.city);
        syncSavedSummary(data);
        if (navigateToDetails) {
          setActiveTab('details');
        }
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') {
          return;
        }
        const message =
          err instanceof Error
            ? err.message
            : 'Unable to load weather data. Please check your connection and try again.';
        setError(message);
      } finally {
        if (inFlightQueryRef.current === cleaned) {
          inFlightQueryRef.current = null;
          setIsLoading(false);
        }
      }
    },
    [isLoading, syncSavedSummary]
  );

  const retryLastSearch = useCallback(async () => {
    const target = lastSearchedCity || currentWeather?.city || 'London';
    await searchCity(target);
  }, [lastSearchedCity, currentWeather, searchCity]);

  const isCitySaved = useCallback(
    (cityName: string, country?: string) => {
      return savedCities.some((item) => {
        const nameMatch = item.city.toLowerCase() === cityName.toLowerCase();
        if (!country) return nameMatch;
        return nameMatch && item.country.toLowerCase() === country.toLowerCase();
      });
    },
    [savedCities]
  );

  const toggleSaveCurrentCity = useCallback(() => {
    if (!currentWeather) return;
    setSavedCities((prev) => {
      const exists = prev.some(
        (item) =>
          item.city.toLowerCase() === currentWeather.city.toLowerCase() &&
          item.country.toLowerCase() === currentWeather.country.toLowerCase()
      );
      const next = exists
        ? prev.filter(
            (item) =>
              !(
                item.city.toLowerCase() === currentWeather.city.toLowerCase() &&
                item.country.toLowerCase() === currentWeather.country.toLowerCase()
              )
          )
        : [toSavedSummary(currentWeather), ...prev];

      storageService.setSavedCities(next);
      return next;
    });
  }, [currentWeather]);

  const removeSavedCity = useCallback((cityName: string, country?: string) => {
    setSavedCities((prev) => {
      const next = prev.filter((item) => {
        const nameMatch = item.city.toLowerCase() === cityName.toLowerCase();
        if (!country) return !nameMatch;
        return !(nameMatch && item.country.toLowerCase() === country.toLowerCase());
      });
      storageService.setSavedCities(next);
      return next;
    });
  }, []);

  const openSavedCityDetails = useCallback(
    async (city: SavedCitySummary) => {
      setActiveTab('details');
      await searchCity(city.city, true);
    },
    [searchCity]
  );

  const refreshSavedCities = useCallback(async () => {
    if (savedCities.length === 0 || isRefreshingSaved) return;
    setIsRefreshingSaved(true);
    try {
      const names = savedCities.map((c) => c.city);
      const updated = await fetchBatchSavedCities(names);
      if (updated.length > 0) {
        setSavedCities((prev) => {
          const merged = prev.map((existing) => {
            const match = updated.find(
              (u) => u.city.toLowerCase() === existing.city.toLowerCase()
            );
            return match ?? existing;
          });
          storageService.setSavedCities(merged);
          return merged;
        });
      }
    } catch {
      // Keep cached summaries silently if batch refresh fails
    } finally {
      setIsRefreshingSaved(false);
    }
  }, [savedCities, isRefreshingSaved]);

  const resetAllPreferences = useCallback(() => {
    storageService.clearAll();
    setSavedCities([]);
    setTempUnitState('C');
    setWindUnitState('km/h');
    setThemeState('light');
  }, []);

  // Load initial weather on mount
  useEffect(() => {
    const initialCity = storageService.getLastCity() || 'London';
    void searchCity(initialCity);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Refresh saved cities summaries once on initial mount if any exist
  useEffect(() => {
    if (savedCities.length > 0) {
      void refreshSavedCities();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const value = useMemo<WeatherContextValue>(
    () => ({
      activeTab,
      setActiveTab,
      currentWeather,
      lastSearchedCity,
      isLoading,
      isRefreshingSaved,
      error,
      savedCities,
      tempUnit,
      windUnit,
      theme,
      searchCity,
      retryLastSearch,
      isCitySaved,
      toggleSaveCurrentCity,
      removeSavedCity,
      openSavedCityDetails,
      refreshSavedCities,
      setTempUnit,
      setWindUnit,
      setTheme,
      resetAllPreferences,
    }),
    [
      activeTab,
      currentWeather,
      lastSearchedCity,
      isLoading,
      isRefreshingSaved,
      error,
      savedCities,
      tempUnit,
      windUnit,
      theme,
      searchCity,
      retryLastSearch,
      isCitySaved,
      toggleSaveCurrentCity,
      removeSavedCity,
      openSavedCityDetails,
      refreshSavedCities,
      setTempUnit,
      setWindUnit,
      setTheme,
      resetAllPreferences,
    ]
  );

  return <WeatherContext.Provider value={value}>{children}</WeatherContext.Provider>;
}

export function useWeather(): WeatherContextValue {
  const ctx = useContext(WeatherContext);
  if (!ctx) {
    throw new Error('useWeather must be used inside a WeatherProvider');
  }
  return ctx;
}
