import React, { useState } from 'react';
import { Info, Moon, RotateCcw, Sun, Thermometer, Wind } from 'lucide-react';
import { useWeather } from '../context/WeatherProvider';
import type { TemperatureUnit, ThemeMode, WindSpeedUnit } from '../types/weather';

export function SettingsScreen() {
  const {
    tempUnit,
    windUnit,
    theme,
    savedCities,
    setTempUnit,
    setWindUnit,
    setTheme,
    resetAllPreferences,
  } = useWeather();

  const [resetNotice, setResetNotice] = useState(false);

  const handleReset = () => {
    resetAllPreferences();
    setResetNotice(true);
    setTimeout(() => setResetNotice(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
          Settings
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          Customize measurement units and display preferences. All choices are saved locally.
        </p>
      </div>

      {/* Units & Theme Card */}
      <section className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800">
        {/* Temperature Unit */}
        <div className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 flex items-center justify-center shrink-0">
              <Thermometer className="w-5 h-5 text-indigo-600 dark:text-indigo-400" aria-hidden="true" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                Temperature Unit
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Choose between Celsius (°C) and Fahrenheit (°F)
              </p>
            </div>
          </div>

          <div
            role="group"
            aria-label="Temperature unit"
            className="inline-flex p-1 rounded-xl bg-slate-100 dark:bg-slate-800 shrink-0"
          >
            {(['C', 'F'] as TemperatureUnit[]).map((unit) => (
              <button
                key={unit}
                type="button"
                onClick={() => setTempUnit(unit)}
                className={`min-h-[40px] px-4 rounded-lg text-sm font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                  tempUnit === unit
                    ? 'bg-white dark:bg-slate-950 text-indigo-600 dark:text-indigo-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                {unit === 'C' ? 'Celsius (°C)' : 'Fahrenheit (°F)'}
              </button>
            ))}
          </div>
        </div>

        {/* Wind Speed Unit */}
        <div className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 flex items-center justify-center shrink-0">
              <Wind className="w-5 h-5 text-blue-600 dark:text-blue-400" aria-hidden="true" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                Wind Speed Unit
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Applies to wind speed and visibility distance
              </p>
            </div>
          </div>

          <div
            role="group"
            aria-label="Wind speed unit"
            className="inline-flex p-1 rounded-xl bg-slate-100 dark:bg-slate-800 shrink-0"
          >
            {(['km/h', 'm/s', 'mph'] as WindSpeedUnit[]).map((unit) => (
              <button
                key={unit}
                type="button"
                onClick={() => setWindUnit(unit)}
                className={`min-h-[40px] px-3.5 rounded-lg text-sm font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                  windUnit === unit
                    ? 'bg-white dark:bg-slate-950 text-indigo-600 dark:text-indigo-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                {unit}
              </button>
            ))}
          </div>
        </div>

        {/* Theme Mode */}
        <div className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-violet-50 dark:bg-violet-950/60 flex items-center justify-center shrink-0">
              {theme === 'dark' ? (
                <Moon className="w-5 h-5 text-violet-600 dark:text-violet-400" aria-hidden="true" />
              ) : (
                <Sun className="w-5 h-5 text-amber-500" aria-hidden="true" />
              )}
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                Appearance
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Switch between Light and Dark interface themes
              </p>
            </div>
          </div>

          <div
            role="group"
            aria-label="Appearance theme"
            className="inline-flex p-1 rounded-xl bg-slate-100 dark:bg-slate-800 shrink-0"
          >
            {(['light', 'dark'] as ThemeMode[]).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => setTheme(mode)}
                className={`min-h-[40px] px-4 rounded-lg text-sm font-semibold capitalize whitespace-nowrap transition-colors cursor-pointer ${
                  theme === mode
                    ? 'bg-white dark:bg-slate-950 text-indigo-600 dark:text-indigo-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Local Data & Reset */}
      <section className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
            Local Storage Data
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Currently storing {savedCities.length} saved{' '}
            {savedCities.length === 1 ? 'city' : 'cities'} and your unit preferences locally.
          </p>
          {resetNotice && (
            <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400 mt-1.5">
              Preferences and saved cities have been reset.
            </p>
          )}
        </div>

        <button
          type="button"
          onClick={handleReset}
          className="min-h-[44px] px-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-rose-400 hover:text-rose-600 dark:hover:text-rose-400 text-sm font-medium text-slate-700 dark:text-slate-200 inline-flex items-center gap-2 whitespace-nowrap shrink-0 transition-colors cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" aria-hidden="true" />
          <span>Reset All Data</span>
        </button>
      </section>

      {/* About Application */}
      <section className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 sm:p-6 space-y-3">
        <div className="flex items-center gap-2.5">
          <Info className="w-5 h-5 text-indigo-600 dark:text-indigo-400" aria-hidden="true" />
          <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
            About WeatherWise
          </h2>
        </div>
        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          WeatherWise is a smart weather dashboard designed for fast city lookups, detailed
          atmospheric telemetry, 5-day multi-day forecasts, and persistent local watchlists.
        </p>
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
          <span>Live Meteorological Data: Open-Meteo &amp; OpenWeatherMap</span>
          <span aria-hidden="true">·</span>
          <span>Local Persistence: Enabled</span>
        </div>
      </section>
    </div>
  );
}
