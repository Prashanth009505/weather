import React from 'react';
import { ChevronRight, RefreshCw, Trash2 } from 'lucide-react';
import { useWeather } from '../context/WeatherProvider';
import { EmptySavedCitiesState } from '../components/StateFeedback';
import { WeatherIcon } from '../components/WeatherIcon';
import { formatTemp, formatTempShort, formatWindSpeed } from '../utils/units';

export function SavedCitiesScreen() {
  const {
    savedCities,
    tempUnit,
    windUnit,
    isRefreshingSaved,
    refreshSavedCities,
    removeSavedCity,
    openSavedCityDetails,
    setActiveTab,
  } = useWeather();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            Saved Cities
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Tap any city to view its detailed forecast
          </p>
        </div>

        {savedCities.length > 0 && (
          <button
            type="button"
            onClick={() => void refreshSavedCities()}
            disabled={isRefreshingSaved}
            className="min-h-[44px] px-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-400 text-sm font-medium text-slate-700 dark:text-slate-200 inline-flex items-center gap-2 whitespace-nowrap shrink-0 transition-colors cursor-pointer"
          >
            <RefreshCw
              className={`w-4 h-4 ${isRefreshingSaved ? 'animate-spin' : ''}`}
              aria-hidden="true"
            />
            <span>{isRefreshingSaved ? 'Refreshing...' : 'Refresh All'}</span>
          </button>
        )}
      </div>

      {savedCities.length === 0 ? (
        <EmptySavedCitiesState
          onAction={() => setActiveTab('home')}
          actionLabel="Search & Save a City"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {savedCities.map((city) => (
            <div
              key={`${city.city}-${city.country}`}
              className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-500 transition-colors flex flex-col justify-between"
            >
              <button
                type="button"
                onClick={() => void openSavedCityDetails(city)}
                className="w-full text-left p-5 flex-1 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded-t-2xl"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 truncate">
                      {city.city}
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                      {[city.region, city.country].filter(Boolean).join(', ')}
                    </p>
                  </div>
                  <WeatherIcon
                    condition={city.condition}
                    isDay={city.isDay}
                    size={44}
                    className="shrink-0"
                  />
                </div>

                <div className="mt-5 flex items-end justify-between gap-4">
                  <div>
                    <div className="text-3xl font-bold text-slate-900 dark:text-slate-100 font-mono-tabular">
                      {formatTemp(city.tempC, tempUnit)}
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-300 mt-0.5">
                      {city.conditionText}
                    </p>
                  </div>

                  <div className="text-right text-xs text-slate-500 dark:text-slate-400 font-mono-tabular space-y-0.5">
                    <p>
                      H {formatTempShort(city.tempMaxC, tempUnit)} / L{' '}
                      {formatTempShort(city.tempMinC, tempUnit)}
                    </p>
                    <p>
                      {city.humidity}% RH · {formatWindSpeed(city.windSpeedKmh, windUnit)}
                    </p>
                  </div>
                </div>
              </button>

              <div className="px-5 py-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => void openSavedCityDetails(city)}
                  className="min-h-[40px] text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline inline-flex items-center gap-1 cursor-pointer"
                >
                  <span>View Forecast</span>
                  <ChevronRight className="w-3.5 h-3.5" aria-hidden="true" />
                </button>

                <button
                  type="button"
                  onClick={() => removeSavedCity(city.city, city.country)}
                  aria-label={`Remove ${city.city} from saved cities`}
                  className="min-h-[40px] min-w-[40px] px-2.5 rounded-lg text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Remove</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
