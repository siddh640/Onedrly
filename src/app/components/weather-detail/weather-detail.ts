import { Component, Input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Weather, WeatherData, ForecastResponse, DayForecast } from '../../services/weather';

@Component({
  selector: 'app-weather-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './weather-detail.html',
  styleUrl: './weather-detail.css'
})
export class WeatherDetail {
  @Input() weatherData: WeatherData | null = null;
  @Input() destination: string = '';
  
  protected showForecast = signal<boolean>(false);
  protected forecast = signal<ForecastResponse | null>(null);
  protected forecastLoading = signal<boolean>(false);
  protected expanded = signal<boolean>(false);

  constructor(private weatherService: Weather) {}

  toggleExpanded(): void {
    this.expanded.set(!this.expanded());
    if (this.expanded() && !this.forecast() && this.destination) {
      this.loadForecast();
    }
  }

  loadForecast(): void {
    if (!this.destination) return;
    
    this.forecastLoading.set(true);
    this.weatherService.getForecast(this.destination).subscribe({
      next: (data: ForecastResponse) => {
        this.forecast.set(data);
        this.forecastLoading.set(false);
      },
      error: (error: Error) => {
        console.error('Error loading forecast:', error);
        this.forecastLoading.set(false);
      }
    });
  }

  toggleForecast(): void {
    this.showForecast.set(!this.showForecast());
    if (this.showForecast() && !this.forecast() && this.destination) {
      this.loadForecast();
    }
  }

  getBackgroundClass(): string {
    if (!this.weatherData) return 'bg-default';
    const main = this.weatherData.condition?.toLowerCase() || '';
    const description = this.weatherData.description?.toLowerCase() || '';
    
    // Clear and sunny conditions
    if (main.includes('clear') || description.includes('clear')) return 'bg-sunny';
    
    // Cloudy conditions
    if (main.includes('cloud') || description.includes('cloud')) return 'bg-cloudy';
    
    // Rainy conditions
    if (main.includes('rain') || main.includes('drizzle') || main.includes('thunder') || 
        description.includes('rain') || description.includes('drizzle') || description.includes('thunder')) {
      return 'bg-rainy';
    }
    
    // Snowy conditions
    if (main.includes('snow') || description.includes('snow')) return 'bg-snow';
    
    // Mist, fog, haze
    if (main.includes('mist') || main.includes('fog') || main.includes('haze') || 
        description.includes('mist') || description.includes('fog') || description.includes('haze')) {
      return 'bg-cloudy';
    }
    
    // Default for other conditions
    return 'bg-default';
  }

  getWeatherIcon(weatherMain: string): string {
    switch (weatherMain.toLowerCase()) {
      case 'rain':
      case 'drizzle':
        return '🌧️';
      case 'thunderstorm':
        return '⛈️';
      case 'clear':
        return '☀️';
      case 'clouds':
        return '☁️';
      case 'snow':
        return '❄️';
      case 'mist':
      case 'fog':
      case 'haze':
        return '🌫️';
      case 'wind':
        return '💨';
      default:
        return '🌤️';
    }
  }

  willItRain(): boolean {
    if (!this.forecast()) return false;
    
    // Check next 5 days for rain
    const next5Days = this.forecast()!.list.slice(0, 40); // 5 days * 8 forecasts per day
    return next5Days.some(forecast => 
      forecast.weather[0].main.toLowerCase().includes('rain') ||
      forecast.weather[0].main.toLowerCase().includes('drizzle') ||
      forecast.weather[0].main.toLowerCase().includes('thunder')
    );
  }

  getRainProbability(): number {
    if (!this.forecast()) return 0;
    
    const next5Days = this.forecast()!.list.slice(0, 40);
    const rainyForecasts = next5Days.filter(forecast => 
      forecast.weather[0].main.toLowerCase().includes('rain') ||
      forecast.weather[0].main.toLowerCase().includes('drizzle') ||
      forecast.weather[0].main.toLowerCase().includes('thunder')
    );
    
    return Math.round((rainyForecasts.length / next5Days.length) * 100);
  }

  getLocalTime(timezoneOffset: number): string {
    const now = new Date();
    const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
    const localTime = new Date(utc + (timezoneOffset * 1000));
    
    return localTime.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  }

  getLocalDate(timezoneOffset: number): string {
    const now = new Date();
    const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
    const localTime = new Date(utc + (timezoneOffset * 1000));
    
    return localTime.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  getForecastLocalTime(dt: number, timezoneOffset: number): string {
    const date = new Date(dt * 1000);
    const utc = date.getTime();
    const localTime = new Date(utc + (timezoneOffset * 1000));
    
    return localTime.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  }

  getForecastLocalDate(dt: number, timezoneOffset: number): string {
    const date = new Date(dt * 1000);
    const utc = date.getTime();
    const localTime = new Date(utc + (timezoneOffset * 1000));
    
    return localTime.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  }

  getDailyForecasts(): DayForecast[] {
    if (!this.forecast()) return [];
    return this.weatherService.transformForecastData(this.forecast()!);
  }
}

