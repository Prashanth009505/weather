import React, { useEffect, useRef, useState } from 'react';
import { MapPin, Search, X } from 'lucide-react';
import { useWeather } from '../context/WeatherProvider';
import { fetchCitySuggestions } from '../services/weatherService';
import type { CitySuggestion } from '../types/weather';

interface WeatherSearchBarProps {
  inputRef?: React.RefObject<HTMLInputElement | null>;
}

export function WeatherSearchBar({ inputRef }: WeatherSearchBarProps) {
  const { searchCity, isLoading } = useWeather();
  const [query, setQuery] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<CitySuggestion[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < 2) {
      setSuggestions([]);
      setIsDropdownOpen(false);
      return;
    }

    const controller = new AbortController();
    const timer = setTimeout(async () => {
      const items = await fetchCitySuggestions(trimmed, controller.signal);
      if (!controller.signal.aborted) {
        setSuggestions(items);
        setIsDropdownOpen(items.length > 0);
      }
    }, 220);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;

    const trimmed = query.trim();
    if (!trimmed) {
      setValidationError('Please enter a city name to search.');
      return;
    }
    if (trimmed.length < 2 || !/[a-zA-Z\u00C0-\u024F]/.test(trimmed)) {
      setValidationError('City name must contain at least 2 letters.');
      return;
    }

    setValidationError(null);
    setIsDropdownOpen(false);
    void searchCity(trimmed);
  };

  const handlePickSuggestion = (item: CitySuggestion) => {
    if (isLoading) return;
    setValidationError(null);
    setQuery(item.name);
    setIsDropdownOpen(false);
    void searchCity(item.name);
  };

  return (
    <div ref={containerRef} className="relative w-full">
      <form onSubmit={handleSubmit} noValidate className="flex flex-col sm:flex-row gap-2.5">
        <div className="relative flex-1">
          <Search
            className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
            aria-hidden="true"
          />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              if (validationError) setValidationError(null);
            }}
            onFocus={() => {
              if (suggestions.length > 0) setIsDropdownOpen(true);
            }}
            placeholder="Search any city (e.g., Tokyo, London, Hyderabad)..."
            aria-label="Search city"
            aria-invalid={Boolean(validationError)}
            className="w-full h-12 pl-10 pr-11 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-colors"
          />
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery('');
                setSuggestions([]);
                setValidationError(null);
                setIsDropdownOpen(false);
              }}
              aria-label="Clear search"
              className="absolute right-1.5 top-1/2 -translate-y-1/2 min-h-[40px] min-w-[40px] flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="h-12 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-semibold whitespace-nowrap shrink-0 transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-950"
        >
          {isLoading ? 'Searching...' : 'Search'}
        </button>
      </form>

      {validationError && (
        <p role="alert" className="mt-2 text-xs font-medium text-rose-600 dark:text-rose-400">
          {validationError}
        </p>
      )}

      {isDropdownOpen && suggestions.length > 0 && (
        <div
          role="listbox"
          aria-label="City suggestions"
          className="absolute left-0 right-0 sm:right-28 top-14 z-30 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-lg overflow-hidden"
        >
          {suggestions.map((item, idx) => (
            <button
              key={`${item.name}-${item.latitude}-${item.longitude}-${idx}`}
              type="button"
              role="option"
              aria-selected={false}
              onClick={() => handlePickSuggestion(item)}
              className="w-full min-h-[44px] px-4 py-2.5 flex items-center gap-3 text-left text-sm text-slate-800 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800/70 transition-colors border-b last:border-b-0 border-slate-100 dark:border-slate-800/70 cursor-pointer"
            >
              <MapPin className="w-4 h-4 text-indigo-500 shrink-0" aria-hidden="true" />
              <span className="font-medium truncate">{item.name}</span>
              <span className="text-xs text-slate-500 dark:text-slate-400 truncate">
                {[item.region, item.country].filter(Boolean).join(', ')}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
