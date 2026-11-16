import React from 'react';
import type { WeatherCondition } from '../types/weather';

interface WeatherIconProps {
  condition: WeatherCondition;
  isDay?: boolean;
  size?: number;
  className?: string;
}

export function WeatherIcon({
  condition,
  isDay = true,
  size = 48,
  className = '',
}: WeatherIconProps) {
  const idPrefix = React.useId().replace(/:/g, '');

  if (condition === 'sunny' && !isDay) {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 64 64"
        fill="none"
        className={className}
        aria-hidden="true"
      >
        <defs>
          <linearGradient id={`${idPrefix}-moon`} x1="16" y1="12" x2="48" y2="52" gradientUnits="userSpaceOnUse">
            <stop stopColor="#E0E7FF" />
            <stop offset="1" stopColor="#818CF8" />
          </linearGradient>
        </defs>
        <path
          d="M39.5 14.5C32.2 14.5 26.3 20.4 26.3 27.7C26.3 35 32.2 40.9 39.5 40.9C42.9 40.9 46 39.6 48.3 37.5C46.3 44.3 40 49.3 32.5 49.3C23.4 49.3 16 41.9 16 32.8C16 23.7 23.4 16.3 32.5 16.3C35 16.3 37.4 16.9 39.5 17.9V14.5Z"
          fill={`url(#${idPrefix}-moon)`}
        />
        <circle cx="46" cy="18" r="2" fill="#E0E7FF" />
        <circle cx="51" cy="26" r="1.4" fill="#C7D2FE" />
      </svg>
    );
  }

  if (condition === 'sunny') {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 64 64"
        fill="none"
        className={className}
        aria-hidden="true"
      >
        <defs>
          <linearGradient id={`${idPrefix}-sun`} x1="18" y1="18" x2="46" y2="46" gradientUnits="userSpaceOnUse">
            <stop stopColor="#FDE047" />
            <stop offset="1" stopColor="#F59E0B" />
          </linearGradient>
        </defs>
        <circle cx="32" cy="32" r="13" fill={`url(#${idPrefix}-sun)`} />
        <g stroke="#FBBF24" strokeWidth="3" strokeLinecap="round">
          <line x1="32" y1="7" x2="32" y2="13" />
          <line x1="32" y1="51" x2="32" y2="57" />
          <line x1="7" y1="32" x2="13" y2="32" />
          <line x1="51" y1="32" x2="57" y2="32" />
          <line x1="14.3" y1="14.3" x2="18.6" y2="18.6" />
          <line x1="45.4" y1="45.4" x2="49.7" y2="49.7" />
          <line x1="49.7" y1="14.3" x2="45.4" y2="18.6" />
          <line x1="18.6" y1="45.4" x2="14.3" y2="49.7" />
        </g>
      </svg>
    );
  }

  if (condition === 'partly-cloudy') {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 64 64"
        fill="none"
        className={className}
        aria-hidden="true"
      >
        <defs>
          <linearGradient id={`${idPrefix}-psun`} x1="14" y1="12" x2="34" y2="32" gradientUnits="userSpaceOnUse">
            <stop stopColor="#FDE047" />
            <stop offset="1" stopColor="#F59E0B" />
          </linearGradient>
          <linearGradient id={`${idPrefix}-pcloud`} x1="16" y1="26" x2="52" y2="50" gradientUnits="userSpaceOnUse">
            <stop stopColor="#FFFFFF" />
            <stop offset="1" stopColor="#CBD5E1" />
          </linearGradient>
        </defs>
        {isDay ? (
          <circle cx="24" cy="23" r="10" fill={`url(#${idPrefix}-psun)`} />
        ) : (
          <path
            d="M27 14C22.6 15.2 19.3 19.2 19.3 24C19.3 29.7 23.9 34.3 29.6 34.3C31.5 34.3 33.3 33.8 34.8 32.9C33.1 35.8 29.9 37.8 26.2 37.8C20.7 37.8 16.3 33.4 16.3 27.9C16.3 22.4 20.7 18 26.2 18C26.5 18 26.7 18 27 18V14Z"
            fill="#C7D2FE"
          />
        )}
        <path
          d="M21 48H45.5C50.2 48 54 44.2 54 39.5C54 35.1 50.6 31.4 46.3 31C44.8 25.8 40 22 34.3 22C27.5 22 22 27.4 21.8 34.1C17.4 34.6 14 38.3 14 42.8C14 45.7 17.1 48 21 48Z"
          fill={`url(#${idPrefix}-pcloud)`}
        />
      </svg>
    );
  }

  if (condition === 'cloudy') {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 64 64"
        fill="none"
        className={className}
        aria-hidden="true"
      >
        <defs>
          <linearGradient id={`${idPrefix}-cloud1`} x1="20" y1="16" x2="54" y2="42" gradientUnits="userSpaceOnUse">
            <stop stopColor="#E2E8F0" />
            <stop offset="1" stopColor="#94A3B8" />
          </linearGradient>
          <linearGradient id={`${idPrefix}-cloud2`} x1="12" y1="26" x2="48" y2="50" gradientUnits="userSpaceOnUse">
            <stop stopColor="#F8FAFC" />
            <stop offset="1" stopColor="#CBD5E1" />
          </linearGradient>
        </defs>
        <path
          d="M26 38H48C51.9 38 55 34.9 55 31C55 27.4 52.3 24.4 48.8 24C47.6 19.4 43.4 16 38.4 16C32.5 16 27.7 20.7 27.5 26.5C23.8 26.9 21 30 21 33.8C21 36.1 23.2 38 26 38Z"
          fill={`url(#${idPrefix}-cloud1)`}
        />
        <path
          d="M17 48H43.5C47.6 48 51 44.6 51 40.5C51 36.6 48 33.4 44.2 33C42.9 28.4 38.7 25 33.6 25C27.5 25 22.6 29.9 22.5 36C18.6 36.4 15.5 39.7 15.5 43.7C15.5 46.1 16.2 48 17 48Z"
          fill={`url(#${idPrefix}-cloud2)`}
        />
      </svg>
    );
  }

  if (condition === 'rain') {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 64 64"
        fill="none"
        className={className}
        aria-hidden="true"
      >
        <defs>
          <linearGradient id={`${idPrefix}-rcloud`} x1="14" y1="16" x2="50" y2="40" gradientUnits="userSpaceOnUse">
            <stop stopColor="#E2E8F0" />
            <stop offset="1" stopColor="#94A3B8" />
          </linearGradient>
        </defs>
        <path
          d="M19 41H45.5C49.6 41 53 37.6 53 33.5C53 29.6 50 26.4 46.2 26C44.9 21.4 40.7 18 35.6 18C29.5 18 24.6 22.9 24.5 29C20.6 29.4 17.5 32.7 17.5 36.7C17.5 39.1 18.2 41 19 41Z"
          fill={`url(#${idPrefix}-rcloud)`}
        />
        <g stroke="#38BDF8" strokeWidth="3" strokeLinecap="round">
          <line x1="23" y1="46" x2="20" y2="54" />
          <line x1="33" y1="46" x2="30" y2="54" />
          <line x1="43" y1="46" x2="40" y2="54" />
        </g>
      </svg>
    );
  }

  if (condition === 'storm') {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 64 64"
        fill="none"
        className={className}
        aria-hidden="true"
      >
        <defs>
          <linearGradient id={`${idPrefix}-scloud`} x1="14" y1="14" x2="50" y2="38" gradientUnits="userSpaceOnUse">
            <stop stopColor="#94A3B8" />
            <stop offset="1" stopColor="#475569" />
          </linearGradient>
        </defs>
        <path
          d="M19 40H45.5C49.6 40 53 36.6 53 32.5C53 28.6 50 25.4 46.2 25C44.9 20.4 40.7 17 35.6 17C29.5 17 24.6 21.9 24.5 28C20.6 28.4 17.5 31.7 17.5 35.7C17.5 38.1 18.2 40 19 40Z"
          fill={`url(#${idPrefix}-scloud)`}
        />
        <path d="M35 37L27 47H33L30 56L41 44H34.5L35 37Z" fill="#FACC15" />
      </svg>
    );
  }

  if (condition === 'snow') {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 64 64"
        fill="none"
        className={className}
        aria-hidden="true"
      >
        <path
          d="M19 40H45.5C49.6 40 53 36.6 53 32.5C53 28.6 50 25.4 46.2 25C44.9 20.4 40.7 17 35.6 17C29.5 17 24.6 21.9 24.5 28C20.6 28.4 17.5 31.7 17.5 35.7C17.5 38.1 18.2 40 19 40Z"
          fill="#E2E8F0"
        />
        <circle cx="24" cy="48" r="2.5" fill="#7DD3FC" />
        <circle cx="33" cy="52" r="2.5" fill="#BAE6FD" />
        <circle cx="42" cy="48" r="2.5" fill="#7DD3FC" />
      </svg>
    );
  }

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M19 36H45.5C49.6 36 53 32.6 53 28.5C53 24.6 50 21.4 46.2 21C44.9 16.4 40.7 13 35.6 13C29.5 13 24.6 17.9 24.5 24C20.6 24.4 17.5 27.7 17.5 31.7C17.5 34.1 18.2 36 19 36Z"
        fill="#CBD5E1"
      />
      <g stroke="#94A3B8" strokeWidth="3" strokeLinecap="round">
        <line x1="16" y1="43" x2="48" y2="43" />
        <line x1="21" y1="50" x2="43" y2="50" />
      </g>
    </svg>
  );
}
