import React, { useRef } from 'react';
import { Bookmark, CloudSun, Home, Search, Settings } from 'lucide-react';
import { WeatherProvider, useWeather } from './context/WeatherProvider';
import { HomeScreen } from './screens/HomeScreen';
import { SavedCitiesScreen } from './screens/SavedCitiesScreen';
import { SettingsScreen } from './screens/SettingsScreen';
import { WeatherDetailsScreen } from './screens/WeatherDetailsScreen';
import type { ScreenTab } from './types/weather';

const NAV_ITEMS: Array<{
  id: ScreenTab;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}> = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'details', label: 'Forecast', icon: CloudSun },
  { id: 'saved', label: 'Saved', icon: Bookmark },
  { id: 'settings', label: 'Settings', icon: Settings },
];

function WeatherWiseShell() {
  const { activeTab, setActiveTab, savedCities } = useWeather();
  const searchInputRef = useRef<HTMLInputElement | null>(null);

  const handlePrimarySearchCta = () => {
    setActiveTab('home');
    requestAnimationFrame(() => {
      searchInputRef.current?.focus();
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200 pb-24 md:pb-12">
      {/* Top Bar (3-Zone Contract on Desktop, Compact App Bar on Mobile) */}
      <header className="md:sticky md:top-0 z-30 bg-white/90 dark:bg-slate-950/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 md:h-16 flex items-center justify-between gap-8">
          {/* Zone 1: Single-line Brand Wordmark */}
          <button
            type="button"
            onClick={() => setActiveTab('home')}
            className="text-lg font-bold tracking-tight text-slate-900 dark:text-slate-100 whitespace-nowrap shrink-0 cursor-pointer font-display"
          >
            WeatherWise
          </button>

          {/* Zone 2: 4 Clean Single-Line Nav Links (Desktop) */}
          <nav
            aria-label="Primary navigation"
            className="hidden md:flex items-center gap-7 text-sm font-medium"
          >
            {NAV_ITEMS.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveTab(item.id)}
                  aria-current={isActive ? 'page' : undefined}
                  className={`py-1 whitespace-nowrap shrink-0 transition-colors cursor-pointer border-b-2 ${
                    isActive
                      ? 'border-indigo-600 dark:border-indigo-400 text-indigo-600 dark:text-indigo-400 font-semibold'
                      : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                  }`}
                >
                  {item.id === 'saved' && savedCities.length > 0
                    ? `${item.label} (${savedCities.length})`
                    : item.label}
                </button>
              );
            })}
          </nav>

          {/* Zone 3: Single Primary Action */}
          <div className="shrink-0">
            <button
              type="button"
              onClick={handlePrimarySearchCta}
              className="min-h-[40px] px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-semibold inline-flex items-center gap-2 whitespace-nowrap shrink-0 transition-colors cursor-pointer"
            >
              <Search className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Search City</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Container */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-6 sm:pt-8">
        {activeTab === 'home' && <HomeScreen searchInputRef={searchInputRef} />}
        {activeTab === 'details' && <WeatherDetailsScreen />}
        {activeTab === 'saved' && <SavedCitiesScreen />}
        {activeTab === 'settings' && <SettingsScreen />}
      </main>

      {/* Mobile Fixed Bottom Navigation Bar */}
      <nav
        aria-label="Mobile bottom navigation"
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800"
      >
        <div className="grid grid-cols-4 h-16">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveTab(item.id)}
                aria-current={isActive ? 'page' : undefined}
                className={`min-h-[44px] flex flex-col items-center justify-center gap-1 transition-colors cursor-pointer ${
                  isActive
                    ? 'text-indigo-600 dark:text-indigo-400'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <Icon className="w-5 h-5" aria-hidden="true" />
                <span className="text-[11px] font-medium tracking-tight whitespace-nowrap">
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

export default function App() {
  return (
    <WeatherProvider>
      <WeatherWiseShell />
    </WeatherProvider>
  );
}
