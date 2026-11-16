import React from 'react';
import { AlertCircle, Bookmark, CloudSun, RefreshCw } from 'lucide-react';

export function LoadingState({ message = 'Fetching live weather conditions...' }: { message?: string }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 sm:p-12 flex flex-col items-center justify-center text-center"
    >
      <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 flex items-center justify-center mb-4">
        <RefreshCw className="w-6 h-6 text-indigo-600 dark:text-indigo-400 animate-spin" aria-hidden="true" />
      </div>
      <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{message}</p>
      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
        Retrieving current metrics and 5-day forecast
      </p>
    </div>
  );
}

interface ErrorStateProps {
  message: string;
  onRetry: () => void;
  isLoading?: boolean;
}

export function ErrorState({ message, onRetry, isLoading = false }: ErrorStateProps) {
  return (
    <div
      role="alert"
      className="rounded-2xl bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-900/60 p-8 flex flex-col items-center justify-center text-center"
    >
      <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/60 flex items-center justify-center mb-4">
        <AlertCircle className="w-6 h-6 text-rose-600 dark:text-rose-400" aria-hidden="true" />
      </div>
      <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
        Could Not Load Weather
      </h2>
      <p className="text-sm text-slate-600 dark:text-slate-300 mt-1.5 max-w-md">{message}</p>
      <button
        type="button"
        onClick={onRetry}
        disabled={isLoading}
        className="mt-5 min-h-[44px] px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white text-sm font-semibold inline-flex items-center gap-2 transition-colors cursor-pointer"
      >
        <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} aria-hidden="true" />
        <span>Retry</span>
      </button>
    </div>
  );
}

interface EmptySavedCitiesStateProps {
  compact?: boolean;
  onAction?: () => void;
  actionLabel?: string;
}

export function EmptySavedCitiesState({
  compact = false,
  onAction,
  actionLabel = 'Search Cities',
}: EmptySavedCitiesStateProps) {
  return (
    <div
      className={`rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 ${
        compact ? 'p-6' : 'p-10 sm:p-12'
      } flex flex-col items-center justify-center text-center`}
    >
      <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-3.5">
        {compact ? (
          <Bookmark className="w-5 h-5 text-slate-500 dark:text-slate-400" aria-hidden="true" />
        ) : (
          <CloudSun className="w-6 h-6 text-indigo-600 dark:text-indigo-400" aria-hidden="true" />
        )}
      </div>
      <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
        No Saved Cities Yet
      </h3>
      <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-sm">
        Save your favourite cities to monitor live temperatures and open their 5-day forecast in one tap.
      </p>
      {onAction && (
        <button
          type="button"
          onClick={onAction}
          className="mt-5 min-h-[44px] px-5 py-2.5 rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-sm font-semibold hover:opacity-90 transition-opacity cursor-pointer"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
