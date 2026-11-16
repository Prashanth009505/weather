import React from 'react';
import {
  ArrowRight,
  Bookmark,
  BookmarkCheck,
  Droplets,
  Eye,
  Gauge,
  RefreshCw,
  Wind,
} from 'lucide-react';
import { useWeather } from '../context/WeatherProvider';
import { EmptySavedCitiesState, ErrorState, LoadingState } from '../components/StateFeedback';
import { WeatherIcon } from '../components/WeatherIcon';
import { WeatherSearchBar } from '../components/WeatherSearchBar';
import {
  formatObservationTime,
  formatTemp,
  formatTempShort,
  formatVisibility,
  formatWindSpeed,
} from '../utils/units';

const QUICK_CITIES = ['London', 'Tokyo', 'New York', 'Hyderabad', 'Paris'];

interface HomeScreenProps {
  searchInputRef?: React.RefObject<HTMLInputElement | null>;
}

function getHeroGradient(isDay: boolean, condition: string): string {
  if (!isDay) {
    return 'bg-gradient-to-br from-slate-900 via-indigo-950 to-violet-950';
  }
  switch (condition) {
    case 'sunny':
      return 'bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-700';
    case 'rain':
    case 'storm':
      return 'bg-gradient-to-br from-slate-800 via-blue-900 to-indigo-900';
    default:
      return 'bg-gradient-to-br from-blue-700 via-indigo-700 to-purple-800';
  }
}

export function HomeScreen({ searchInputRef }: HomeScreenProps) {
  const {
    currentWeather,
    isLoading,
    error,
    savedCities,
    tempUnit,
    windUnit,
    searchCity,
    retryLastSearch,
    isCitySaved,
    toggleSaveCurrentCity,
    openSavedCityDetails,
    setActiveTab,
  } = useWeather();

  const saved = currentWeather
    ? isCitySaved(currentWeather.city, currentWeather.country)
    : false;

  return (
    <div className="space-y-6">
      {/* Search & Quick City Selection */}
      <section aria-label="City Search" className="space-y-3">
        <WeatherSearchBar inputRef={searchInputRef} />
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400 mr-1">
            Popular:
          </span>
          {QUICK_CITIES.map((city) => {
            const isActive =
              currentWeather?.city.toLowerCase() === city.toLowerCase();
            return (
              <button
                key={city}
                type="button"
                onClick={() => void searchCity(city)}
                disabled={isLoading}
                className={`min-h-[36px] px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-500'
                }`}
              >
                {city}
              </button>
            );
          })}
        </div>
      </section>

      {/* Main Content Area */}
      {isLoading && !currentWeather ? (
        <LoadingState />
      ) : error && !currentWeather ? (
        <ErrorState message={error} onRetry={() => void retryLastSearch()} isLoading={isLoading} />
      ) : (
        <>
          {error && (
            <ErrorState
              message={error}
              onRetry={() => void retryLastSearch()}
              isLoading={isLoading}
            />
          )}

          {currentWeather && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
              {/* Primary Current Weather Hero Card */}
              <section
                aria-label="Current weather overview"
                className={`lg:col-span-7 rounded-3xl p-6 sm:p-8 text-white shadow-sm flex flex-col justify-between ${getHeroGradient(
                  currentWeather.isDay,
                  currentWeather.condition
                )}`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-balance">
                      {currentWeather.city}
                    </h1>
                    <p className="text-sm text-indigo-100/90 mt-1">
                      {[currentWeather.region, currentWeather.country].filter(Boolean).join(', ')}
                      {' · '}
                      {formatObservationTime(currentWeather.observationTime)}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => void searchCity(currentWeather.city)}
                      disabled={isLoading}
                      aria-label="Refresh current weather"
                      className="min-h-[44px] min-w-[44px] rounded-xl bg-white/15 hover:bg-white/25 flex items-center justify-center transition-colors cursor-pointer"
                    >
                      <RefreshCw
                        className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`}
                        aria-hidden="true"
                      />
                    </button>
                    <button
                      type="button"
                      onClick={toggleSaveCurrentCity}
                      aria-label={saved ? 'Remove city from saved list' : 'Save city to favourites'}
                      className="min-h-[44px] px-4 rounded-xl bg-white/15 hover:bg-white/25 text-sm font-medium inline-flex items-center gap-2 whitespace-nowrap shrink-0 transition-colors cursor-pointer"
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
                </div>

                <div className="my-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                  <div className="flex items-center gap-5">
                    <WeatherIcon
                      condition={currentWeather.condition}
                      isDay={currentWeather.isDay}
                      size={80}
                      className="shrink-0"
                    />
                    <div>
                      <div className="text-5xl sm:text-6xl font-bold tracking-tight font-mono-tabular">
                        {formatTemp(currentWeather.tempC, tempUnit)}
                      </div>
                      <p className="text-base sm:text-lg font-medium text-indigo-100 mt-1">
                        {currentWeather.conditionText}
                      </p>
                    </div>
                  </div>

                  <div className="flex sm:flex-col gap-4 sm:gap-1.5 sm:text-right text-sm text-indigo-100/90 font-mono-tabular">
                    <span>Feels like {formatTemp(currentWeather.feelsLikeC, tempUnit)}</span>
                    <span>
                      High {formatTempShort(currentWeather.tempMaxC, tempUnit)} / Low{' '}
                      {formatTempShort(currentWeather.tempMinC, tempUnit)}
                    </span>
                  </div>
                </div>

                {/* Atmospheric Quick Strip */}
                <div className="pt-5 border-t border-white/15 grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div>
                    <div className="flex items-center gap-1.5 text-xs text-indigo-100/80">
                      <Droplets className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>Humidity</span>
                    </div>
                    <p className="mt-1 text-base font-semibold font-mono-tabular">
                      {currentWeather.humidity}%
                    </p>
                  </div>

                  <div>
                    <div className="flex items-center gap-1.5 text-xs text-indigo-100/80">
                      <Wind className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>Wind Speed</span>
                    </div>
                    <p className="mt-1 text-base font-semibold font-mono-tabular">
                      {formatWindSpeed(currentWeather.windSpeedKmh, windUnit)}
                    </p>
                  </div>

                  <div>
                    <div className="flex items-center gap-1.5 text-xs text-indigo-100/80">
                      <Gauge className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>Pressure</span>
                    </div>
                    <p className="mt-1 text-base font-semibold font-mono-tabular">
                      {currentWeather.pressureHpa} hPa
                    </p>
                  </div>

                  <div>
                    <div className="flex items-center gap-1.5 text-xs text-indigo-100/80">
                      <Eye className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>Visibility</span>
                    </div>
                    <p className="mt-1 text-base font-semibold font-mono-tabular">
                      {formatVisibility(currentWeather.visibilityKm, windUnit)}
                    </p>
                  </div>
                </div>
              </section>

              {/* 5-Day Forecast Preview Panel */}
              <section
                aria-label="5-Day forecast preview"
                className="lg:col-span-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-4 mb-4">
                    <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                      5-Day Forecast
                    </h2>
                    <button
                      type="button"
                      onClick={() => setActiveTab('details')}
                      className="min-h-[40px] px-2 text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 inline-flex items-center gap-1 whitespace-nowrap shrink-0 cursor-pointer"
                    >
                      <span>Full Details</span>
                      <ArrowRight className="w-4 h-4" aria-hidden="true" />
                    </button>
                  </div>

                  <div className="divide-y divide-slate-100 dark:divide-slate-800">
                    {currentWeather.forecast.slice(0, 5).map((day) => (
                      <div
                        key={day.date}
                        className="py-3 first:pt-1 last:pb-1 flex items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <WeatherIcon
                            condition={day.condition}
                            isDay={true}
                            size={32}
                            className="shrink-0"
                          />
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
                              {day.dayLabel}
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                              {day.conditionText}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 font-mono-tabular text-sm shrink-0">
                          <span className="text-slate-500 dark:text-slate-400">
                            {formatTempShort(day.tempMinC, tempUnit)}
                          </span>
                          <span className="font-semibold text-slate-900 dark:text-slate-100">
                            {formatTempShort(day.tempMaxC, tempUnit)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setActiveTab('details')}
                  className="mt-5 w-full min-h-[44px] rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-slate-100 text-sm font-semibold transition-colors cursor-pointer"
                >
                  Open Weather Details &amp; Hourly Outlook
                </button>
              </section>
            </div>
          )}

          {/* Saved Cities Quick Section / Empty State */}
          <section aria-label="Saved cities summary" className="space-y-3">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                Saved Cities
              </h2>
              {savedCities.length > 0 && (
                <button
                  type="button"
                  onClick={() => setActiveTab('saved')}
                  className="min-h-[40px] px-2 text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:underline whitespace-nowrap shrink-0 cursor-pointer"
                >
                  Manage All ({savedCities.length})
                </button>
              )}
            </div>

            {savedCities.length === 0 ? (
              <EmptySavedCitiesState
                compact
                onAction={currentWeather ? toggleSaveCurrentCity : undefined}
                actionLabel={
                  currentWeather
                    ? `Save ${currentWeather.city}`
                    : 'Search Cities'
                }
              />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {savedCities.slice(0, 3).map((city) => (
                  <button
                    key={`${city.city}-${city.country}`}
                    type="button"
                    onClick={() => void openSavedCityDetails(city)}
                    className="text-left rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-500 p-4 flex items-center justify-between gap-4 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <WeatherIcon
                        condition={city.condition}
                        isDay={city.isDay}
                        size={40}
                        className="shrink-0"
                      />
                      <div className="min-w-0">
                        <p className="text-base font-semibold text-slate-900 dark:text-slate-100 truncate">
                          {city.city}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                          {city.conditionText}
                          {city.country ? ` · ${city.country}` : ''}
                        </p>
                      </div>
                    </div>
                    <span className="text-xl font-bold text-slate-900 dark:text-slate-100 font-mono-tabular shrink-0">
                      {formatTemp(city.tempC, tempUnit)}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}
