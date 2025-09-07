import { useState, useEffect } from 'react';
import { weatherService, WeatherData } from '@/services/weatherService';

interface UseWeatherProps {
  city?: string;
  lat?: number;
  lng?: number;
  enabled?: boolean;
}

interface UseWeatherReturn {
  weather: WeatherData | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export const useWeather = ({ city, lat, lng, enabled = true }: UseWeatherProps): UseWeatherReturn => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState<string | null>(null);

  const fetchWeather = async () => {
    if (!enabled) return;
    
    setLoading(true);
    setError(null);

    try {
      let result: WeatherData | null = null;
      
      if (city) {
        result = await weatherService.getWeatherByCity(city);
      } else if (lat !== undefined && lng !== undefined) {
        result = await weatherService.getWeatherByCoords(lat, lng);
      }

      setWeather(result);
      if (!result) {
        setError('Failed to fetch weather data');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const refetch = () => {
    fetchWeather();
  };

  useEffect(() => {
    fetchWeather();
  }, [city, lat, lng, enabled]);

  return { weather, loading, error, refetch };
};