import { supabase } from '@/integrations/supabase/client';

interface WeatherData {
  temperature: number;
  condition: string;
  description: string;
  icon: string;
  city?: string;
}

interface CacheEntry {
  data: WeatherData;
  timestamp: number;
}

class WeatherService {
  private cache = new Map<string, CacheEntry>();
  private readonly CACHE_DURATION = 10 * 60 * 1000; // 10 minutes in milliseconds

  private getCacheKey(query: string): string {
    return `weather_${query}`;
  }

  private isValidCache(entry: CacheEntry): boolean {
    return Date.now() - entry.timestamp < this.CACHE_DURATION;
  }

  private getFromCache(cacheKey: string): WeatherData | null {
    const cached = this.cache.get(cacheKey);
    if (cached && this.isValidCache(cached)) {
      return cached.data;
    }
    if (cached) {
      this.cache.delete(cacheKey); // Remove expired cache
    }
    return null;
  }

  private setCache(cacheKey: string, data: WeatherData): void {
    this.cache.set(cacheKey, {
      data,
      timestamp: Date.now()
    });
  }

  async getWeatherByCity(city: string): Promise<WeatherData | null> {
    const cacheKey = this.getCacheKey(`city_${city}`);
    const cached = this.getFromCache(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      const { data, error } = await supabase.functions.invoke('weather', {
        body: { city },
      });

      if (error) {
        throw new Error(error.message);
      }

      const result = data;
      if (result.success) {
        const weatherData: WeatherData = {
          temperature: Math.round(result.data.temperature),
          condition: result.data.condition,
          description: result.data.condition,
          icon: this.getWeatherIcon(result.data.condition),
          city: result.data.city
        };
        
        this.setCache(cacheKey, weatherData);
        return weatherData;
      }
      return null;
    } catch (error) {
      console.error('Weather fetch error:', error);
      return null;
    }
  }

  async getWeatherByCoords(lat: number, lng: number): Promise<WeatherData | null> {
    const cacheKey = this.getCacheKey(`coords_${lat.toFixed(4)}_${lng.toFixed(4)}`);
    const cached = this.getFromCache(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      const { data, error } = await supabase.functions.invoke('weather', {
        body: { lat, lng },
      });

      if (error) {
        throw new Error(error.message);
      }

      const result = data;
      if (result.success) {
        const weatherData: WeatherData = {
          temperature: Math.round(result.data.temperature),
          condition: result.data.condition,
          description: result.data.condition,
          icon: this.getWeatherIcon(result.data.condition)
        };
        
        this.setCache(cacheKey, weatherData);
        return weatherData;
      }
      return null;
    } catch (error) {
      console.error('Weather fetch error:', error);
      return null;
    }
  }

  private getWeatherIcon(condition: string): string {
    const lowerCondition = condition.toLowerCase();
    if (lowerCondition.includes('clear')) return '☀️';
    if (lowerCondition.includes('cloud')) return '☁️';
    if (lowerCondition.includes('rain')) return '🌧️';
    if (lowerCondition.includes('storm') || lowerCondition.includes('thunder')) return '⛈️';
    if (lowerCondition.includes('snow')) return '❄️';
    if (lowerCondition.includes('fog') || lowerCondition.includes('mist')) return '🌫️';
    if (lowerCondition.includes('wind')) return '💨';
    return '🌤️'; // default partly cloudy
  }

  clearCache(): void {
    this.cache.clear();
  }
}

export const weatherService = new WeatherService();
export type { WeatherData };