import type { TemperatureUnit, WindSpeedUnit } from '../types/weather';

export function convertTemp(tempC: number, unit: TemperatureUnit): number {
  if (unit === 'F') {
    return Math.round(((tempC * 9) / 5 + 32) * 10) / 10;
  }
  return Math.round(tempC * 10) / 10;
}

export function formatTemp(tempC: number, unit: TemperatureUnit, decimals = 0): string {
  const val = convertTemp(tempC, unit);
  const rounded = decimals === 0 ? Math.round(val) : Number(val.toFixed(decimals));
  return `${rounded}°${unit}`;
}

export function formatTempShort(tempC: number, unit: TemperatureUnit): string {
  const val = Math.round(convertTemp(tempC, unit));
  return `${val}°`;
}

export function convertWindSpeed(kmh: number, unit: WindSpeedUnit): number {
  if (unit === 'm/s') return Math.round((kmh / 3.6) * 10) / 10;
  if (unit === 'mph') return Math.round(kmh * 0.621371 * 10) / 10;
  return Math.round(kmh * 10) / 10;
}

export function formatWindSpeed(kmh: number, unit: WindSpeedUnit): string {
  const val = convertWindSpeed(kmh, unit);
  return `${val} ${unit}`;
}

export function formatVisibility(km: number, windUnit: WindSpeedUnit): string {
  if (windUnit === 'mph') {
    const miles = Math.round(km * 0.621371 * 10) / 10;
    return `${miles} mi`;
  }
  return `${km} km`;
}

export function formatObservationTime(isoTime: string): string {
  if (!isoTime) return 'Updated just now';
  const normalized = isoTime.includes('T') && !isoTime.endsWith('Z') ? isoTime : isoTime;
  const date = new Date(normalized);
  if (Number.isNaN(date.getTime())) {
    return isoTime;
  }
  return date.toLocaleString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}
