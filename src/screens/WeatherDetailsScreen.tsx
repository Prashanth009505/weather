import React from 'react';
import {
  ArrowLeft,
  Bookmark,
  BookmarkCheck,
  CloudRain,
  Droplets,
  Eye,
  Gauge,
  Sun,
  Thermometer,
  Wind,
} from 'lucide-react';
import { useWeather } from '../context/WeatherProvider';
import { ErrorState, LoadingState } from '../components/StateFeedback';
import { WeatherIcon } from '../components/WeatherIcon';
import {
  formatObservationTime,
  formatTemp,
  formatTempShort,
  formatVisibility,
  formatWindSpeed,
} from '../utils/units';

export function WeatherDetailsScreen() {
  const {
    currentWeather,
    isLoading,
    error,
    tempUnit,
    windUnit,
    retryLastSearch,
    isCitySaved,
    toggleSaveCurrentCity,
    setActiveTab,
  } = useWeather();

  if (isLoading && !currentWeather) {
    return <LoadingState message="Loading detailed forecast..." />;
  }

  if (error && !currentWeather) {
    return <ErrorState message={error} onRetry={() => void retryLastSearch()} isLoading={isLoading} />;
  }

  if (!currentWeather) {
    return (
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-10 text-center">
        <p className="text-base font-semibold text-slate-900 dark:text-slate-100">
          No City Selected
        </p>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Search for a city on the Home screen to inspect its full 5-day forecast and atmospheric details.
        </p>
        <button
          type="button"
          onClick={() => setActiveTab('home')}
          className="mt-5 min-h-[44px] px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold cursor-pointer"
        >
          Go to Home
        </button>
      </div>
    );
  }

  const saved = isCitySaved(currentWeather.city, currentWeather.country);

  const allMins = currentWeather.forecast.map((f) => f.tempMinC);
  const allMaxs = currentWeather.forecast.map((f) => f.tempMaxC);
  const weekMin = Math.min(...allMins);
  const weekMax = Math.max(...allMaxs);
  const weekSpan = Math.max(weekMax - weekMin, 1);

  return (
    <div className="space-y-6">
      {/* Top Contextual Bar */}
      <div className="flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={() => setActiveTab('home')}
          className="min-h-[44px] px-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm font-medium text-slate-700 dark:text-slate-200 hover:border-indigo-400 inline-flex items-center gap-2 whitespace-nowrap shrink-0 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" aria-hidden="true" />
          <span>Back to Home</span>
        </button>

        <button
          type="button"
          onClick={toggleSaveCurrentCity}
          className={`min-h-[44px] px-4 rounded-xl text-sm font-semibold inline-flex items-center gap-2 whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
            saved
              ? 'bg-indigo-600 text-white hover:bg-indigo-700'
              : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 hover:border-indigo-400'
          }`}
        >
          {saved ? (
            <>
              <BookmarkCheck className="w-4 h-4" aria-hidden="true" />
              <span>Saved</span>
            </>
          ) : (
            <>
              <Bookmark className="w-4 h-4" aria-hidden="true" />
              <span>Save City</span>
            </>
          )}
        </button>
      </div>

      {/* City Detail Summary Header */}
      <section className="rounded-3xl bg-gradient-to-br from-blue-700 via-indigo-700 to-purple-800 text-white p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <WeatherIcon
            condition={currentWeather.condition}
            isDay={currentWeather.isDay}
            size={76}
            className="shrink-0"
          />
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              {currentWeather.city}
            </h1>
            <p className="text-sm text-indigo-100/90 mt-1">
              {[currentWeather.region, currentWeather.country].filter(Boolean).join(', ')}
              {' · '}
              {formatObservationTime(currentWeather.observationTime)}
            </p>
            <p className="text-sm font-medium text-indigo-100 mt-1.5">
              {currentWeather.conditionText}
              {' · '}
              Feels like {formatTemp(currentWeather.feelsLikeC, tempUnit)}
            </p>
          </div>
        </div>

        <div className="flex md:flex-col items-baseline md:items-end justify-between gap-2 font-mono-tabular">
          <span className="text-5xl font-bold tracking-tight">
            {formatTemp(currentWeather.tempC, tempUnit)}
          </span>
          <span className="text-sm text-indigo-100">
            Min {formatTempShort(currentWeather.tempMinC, tempUnit)} / Max{' '}
            {formatTempShort(currentWeather.tempMaxC, tempUnit)}
          </span>
        </div>
      </section>

      {/* Atmospheric Telemetry Cards */}
      <section aria-label="Detailed atmospheric metrics">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-3">
          Atmospheric Conditions
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4">
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <Thermometer className="w-4 h-4 text-indigo-500" aria-hidden="true" />
              <span>Min / Max</span>
            </div>
            <p className="mt-2 text-lg font-bold text-slate-900 dark:text-slate-100 font-mono-tabular">
              {formatTempShort(currentWeather.tempMinC, tempUnit)} /{' '}
              {formatTempShort(currentWeather.tempMaxC, tempUnit)}
            </p>
          </div>

          <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4">
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <Droplets className="w-4 h-4 text-blue-500" aria-hidden="true" />
              <span>Humidity</span>
            </div>
            <p className="mt-2 text-lg font-bold text-slate-900 dark:text-slate-100 font-mono-tabular">
              {currentWeather.humidity}%
            </p>
          </div>

          <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4">
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <Wind className="w-4 h-4 text-indigo-500" aria-hidden="true" />
              <span>Wind Speed</span>
            </div>
            <p className="mt-2 text-lg font-bold text-slate-900 dark:text-slate-100 font-mono-tabular">
              {formatWindSpeed(currentWeather.windSpeedKmh, windUnit)}
            </p>
          </div>

          <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4">
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <Gauge className="w-4 h-4 text-violet-500" aria-hidden="true" />
              <span>Pressure</span>
            </div>
            <p className="mt-2 text-lg font-bold text-slate-900 dark:text-slate-100 font-mono-tabular">
              {currentWeather.pressureHpa} hPa
            </p>
          </div>

          <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4">
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <Eye className="w-4 h-4 text-blue-500" aria-hidden="true" />
              <span>Visibility</span>
            </div>
            <p className="mt-2 text-lg font-bold text-slate-900 dark:text-slate-100 font-mono-tabular">
              {formatVisibility(currentWeather.visibilityKm, windUnit)}
            </p>
          </div>

          <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4">
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <Sun className="w-4 h-4 text-amber-500" aria-hidden="true" />
              <span>UV Index</span>
            </div>
            <p className="mt-2 text-lg font-bold text-slate-900 dark:text-slate-100 font-mono-tabular">
              {currentWeather.uvIndex}
            </p>
          </div>
        </div>
      </section>

      {/* Hourly Outlook */}
      {currentWeather.hourly.length > 0 && (
        <section aria-label="Hourly weather outlook" className="space-y-3">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            Hourly Outlook
          </h2>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {currentWeather.hourly.map((slot) => (
              <div
                key={slot.time}
                className="min-w-[104px] rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 flex flex-col items-center text-center shrink-0"
              >
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  {slot.hourLabel}
                </span>
                <WeatherIcon
                  condition={slot.condition}
                  isDay={currentWeather.isDay}
                  size={34}
                  className="my-2.5"
                />
                <span className="text-base font-bold text-slate-900 dark:text-slate-100 font-mono-tabular">
                  {formatTemp(slot.tempC, tempUnit)}
                </span>
                <span className="mt-1 text-xs text-blue-600 dark:text-blue-400 font-mono-tabular">
                  {slot.precipitationProbability}% rain
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 5-Day Multi-Day Forecast */}
      <section aria-label="5-Day multi-day forecast" className="space-y-3">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
          5-Day Weather Forecast
        </h2>
        <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800">
          {currentWeather.forecast.map((day) => {
            const leftPct = ((day.tempMinC - weekMin) / weekSpan) * 100;
            const widthPct = Math.max(((day.tempMaxC - day.tempMinC) / weekSpan) * 100, 8);

            return (
              <div
                key={day.date}
                className="p-4 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex items-center gap-4 min-w-[200px]">
                  <WeatherIcon
                    condition={day.condition}
                    isDay={true}
                    size={40}
                    className="shrink-0"
                  />
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                      {day.dayLabel}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {day.shortDate} · {day.conditionText}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-6 text-xs text-slate-500 dark:text-slate-400 font-mono-tabular">
                  <span className="inline-flex items-center gap-1.5">
                    <CloudRain className="w-3.5 h-3.5 text-blue-500" aria-hidden="true" />
                    {day.precipitationProbability}%
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Wind className="w-3.5 h-3.5 text-indigo-500" aria-hidden="true" />
                    {formatWindSpeed(day.windSpeedKmh, windUnit)}
                  </span>
                </div>

                <div className="flex items-center gap-3 sm:w-56 font-mono-tabular text-sm">
                  <span className="w-10 text-right text-slate-500 dark:text-slate-400">
                    {formatTempShort(day.tempMinC, tempUnit)}
                  </span>
                  <div className="flex-1 h-2 rounded-full bg-slate-100 dark:bg-slate-800 relative overflow-hidden">
                    <div
                      className="absolute top-0 bottom-0 rounded-full bg-gradient-to-r from-blue-500 to-violet-500"
                      style={{
                        left: `${leftPct}%`,
                        width: `${Math.min(widthPct, 100 - leftPct)}%`,
                      }}
                    />
                  </div>
                  <span className="w-10 font-semibold text-slate-900 dark:text-slate-100">
                    {formatTempShort(day.tempMaxC, tempUnit)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
