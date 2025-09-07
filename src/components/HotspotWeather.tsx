import React from 'react';
import { useWeather } from '@/hooks/useWeather';

interface HotspotWeatherProps {
  lat: number;
  lng: number;
  className?: string;
}

const HotspotWeather: React.FC<HotspotWeatherProps> = ({ lat, lng, className = "" }) => {
  const { weather, loading } = useWeather({ lat, lng });

  if (loading) {
    return (
      <div className={`flex items-center gap-2 text-sm text-muted-foreground ${className}`}>
        <span>🌤️</span>
        <span>Loading...</span>
      </div>
    );
  }

  if (!weather) {
    return (
      <div className={`flex items-center gap-2 text-sm text-muted-foreground ${className}`}>
        <span>🌤️</span>
        <span>Weather: N/A</span>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2 text-sm text-muted-foreground ${className}`}>
      <span>{weather.icon}</span>
      <span>{weather.temperature}°C, {weather.condition}</span>
    </div>
  );
};

export default HotspotWeather;