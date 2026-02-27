'use client';

import { useState } from 'react';
import { Cloud, CloudRain, CloudSnow, Sun, CloudSun, Loader2, RefreshCw, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

interface WeatherDay {
  date: string;
  tempMin: number;
  tempMax: number;
  precipitation: number;
  weatherCode: number;
  description: string;
}

interface WeatherForecast {
  daily: WeatherDay[];
  location: {
    name: string;
    latitude: number;
    longitude: number;
  };
}

interface WeatherForecastProps {
  tripId: string;
  destination: string;
  startDate: string;
  endDate: string;
  initialForecast: WeatherForecast | null;
}

function getWeatherIcon(code: number) {
  // Clear
  if (code === 0) return <Sun className="h-8 w-8 text-yellow-500" />;
  // Mainly clear, partly cloudy
  if (code <= 2) return <CloudSun className="h-8 w-8 text-yellow-500" />;
  // Cloudy, foggy
  if (code <= 48) return <Cloud className="h-8 w-8 text-gray-500" />;
  // Rain, drizzle
  if (code <= 67) return <CloudRain className="h-8 w-8 text-blue-500" />;
  // Snow
  if (code <= 86) return <CloudSnow className="h-8 w-8 text-blue-300" />;
  // Thunderstorm
  return <Zap className="h-8 w-8 text-yellow-600" />;
}

export function WeatherForecastDisplay({
  tripId,
  destination,
  startDate,
  endDate,
  initialForecast,
}: WeatherForecastProps) {
  const [forecast, setForecast] = useState<WeatherForecast | null>(initialForecast);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchWeather = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Call the Edge Function
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/fetch-weather`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({
            tripId,
            destination,
            startDate,
            endDate,
          }),
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to fetch weather');
      }

      const data = await response.json();
      setForecast(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch weather');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg">Weather Forecast</CardTitle>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchWeather}
          disabled={isLoading}
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
        </Button>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        {!forecast && !error && !isLoading && (
          <div className="flex flex-col items-center py-6 text-center">
            <Cloud className="h-12 w-12 text-muted-foreground" />
            <p className="mt-4 text-sm text-muted-foreground">
              Click refresh to fetch the weather forecast for {destination}.
            </p>
            <Button className="mt-4" onClick={fetchWeather}>
              Fetch Weather
            </Button>
          </div>
        )}

        {isLoading && !forecast && (
          <div className="flex flex-col items-center py-6">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <p className="mt-2 text-sm text-muted-foreground">Fetching weather...</p>
          </div>
        )}

        {forecast && (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              {forecast.location.name}
            </p>
            <ScrollArea className="w-full whitespace-nowrap">
              <div className="flex gap-3 pb-3">
                {forecast.daily.map((day) => (
                  <div
                    key={day.date}
                    className="flex flex-col items-center rounded-lg border p-3 min-w-[100px]"
                  >
                    <p className="text-xs font-medium">{formatDate(day.date)}</p>
                    <div className="my-2">{getWeatherIcon(day.weatherCode)}</div>
                    <p className="text-sm font-medium">
                      {Math.round(day.tempMax)}° / {Math.round(day.tempMin)}°
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {day.description}
                    </p>
                    {day.precipitation > 0 && (
                      <p className="text-xs text-blue-500 mt-1">
                        {day.precipitation.toFixed(1)}mm
                      </p>
                    )}
                  </div>
                ))}
              </div>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
