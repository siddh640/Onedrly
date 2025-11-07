import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { map, catchError, switchMap } from 'rxjs/operators';

export interface WeatherData {
  temperature: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  icon: string;
  forecast: DayForecast[];
  // Extended OpenWeather data
  city?: string;
  country?: string;
  feelsLike?: number;
  pressure?: number;
  visibility?: number;
  windDirection?: number;
  timezone?: number;
  description?: string;
  weatherIcon?: string;
  tempMin?: number;
  tempMax?: number;
}

export interface DayForecast {
  day: string;
  high: number;
  low: number;
  condition: string;
  icon: string;
  // Extended forecast data
  dt?: number;
  humidity?: number;
  windSpeed?: number;
  pressure?: number;
  description?: string;
  dateTime?: string;
}

export interface OpenWeatherResponse {
  name: string;
  sys: { country: string };
  weather: { main: string; description: string; icon: string }[];
  main: { 
    temp: number; 
    humidity: number; 
    feels_like: number;
    pressure: number;
    temp_min: number;
    temp_max: number;
  };
  wind: { speed: number; deg: number };
  visibility: number;
  dt: number;
  timezone: number;
}

export interface ForecastResponse {
  list: {
    dt: number;
    main: {
      temp: number;
      temp_min: number;
      temp_max: number;
      humidity: number;
      pressure: number;
    };
    weather: {
      main: string;
      description: string;
      icon: string;
    }[];
    wind: {
      speed: number;
      deg: number;
    };
    dt_txt: string;
  }[];
  city: {
    name: string;
    country: string;
    timezone: number;
  };
}

@Injectable({
  providedIn: 'root'
})
export class Weather {
  private readonly OPENWEATHER_API_KEY = '724b2996b7c101c6669520e167bb44dc';
  private readonly OPENWEATHER_BASE_URL = 'https://api.openweathermap.org/data/2.5';

  constructor(private http: HttpClient) {}
  
  getWeather(destination: string): Observable<WeatherData> {
    const url = `${this.OPENWEATHER_BASE_URL}/weather?q=${encodeURIComponent(destination)}&appid=${this.OPENWEATHER_API_KEY}&units=metric`;
    
    return this.http.get<OpenWeatherResponse>(url).pipe(
      map(response => this.transformOpenWeatherData(response)),
      catchError(error => {
        console.error('Error fetching weather from OpenWeather:', error);
        return this.getMockWeather();
      })
    );
  }

  getWeatherByCoordinates(lat: number, lon: number): Observable<WeatherData> {
    const url = `${this.OPENWEATHER_BASE_URL}/weather?lat=${lat}&lon=${lon}&appid=${this.OPENWEATHER_API_KEY}&units=metric`;
    
    return this.http.get<OpenWeatherResponse>(url).pipe(
      map(response => this.transformOpenWeatherData(response)),
      catchError(this.handleError)
    );
  }

  getForecast(destination: string): Observable<ForecastResponse> {
    const url = `${this.OPENWEATHER_BASE_URL}/forecast?q=${encodeURIComponent(destination)}&appid=${this.OPENWEATHER_API_KEY}&units=metric`;
    
    return this.http.get<ForecastResponse>(url).pipe(
      catchError(this.handleError)
    );
  }

  getForecastByCoordinates(lat: number, lon: number): Observable<ForecastResponse> {
    const url = `${this.OPENWEATHER_BASE_URL}/forecast?lat=${lat}&lon=${lon}&appid=${this.OPENWEATHER_API_KEY}&units=metric`;
    
    return this.http.get<ForecastResponse>(url).pipe(
      catchError(this.handleError)
    );
  }

  private transformOpenWeatherData(response: OpenWeatherResponse): WeatherData {
    const weatherCode = response.weather[0].main.toLowerCase();
    const icon = this.getWeatherIcon(weatherCode);
    
    return {
      temperature: Math.round(response.main.temp),
      condition: response.weather[0].main,
      humidity: response.main.humidity,
      windSpeed: Math.round(response.wind.speed * 3.6), // Convert m/s to km/h
      icon: icon,
      forecast: [], // Will be populated separately
      city: response.name,
      country: response.sys.country,
      feelsLike: Math.round(response.main.feels_like),
      pressure: response.main.pressure,
      visibility: response.visibility,
      windDirection: response.wind.deg,
      timezone: response.timezone,
      description: response.weather[0].description,
      weatherIcon: response.weather[0].icon,
      tempMin: Math.round(response.main.temp_min),
      tempMax: Math.round(response.main.temp_max)
    };
  }

  transformForecastData(forecastResponse: ForecastResponse): DayForecast[] {
    const forecast: DayForecast[] = [];
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    // Group forecasts by day and get one per day for next 5 days
    const dailyForecasts = new Map<string, typeof forecastResponse.list[0]>();
    
    for (const item of forecastResponse.list) {
      const date = new Date(item.dt * 1000);
      const dateKey = date.toDateString();
      
      // Only take the midday forecast (around 12:00) for each day
      if (!dailyForecasts.has(dateKey) || date.getHours() === 12) {
        dailyForecasts.set(dateKey, item);
      }
    }
    
    // Convert to array and take first 5 days
    const entries = Array.from(dailyForecasts.values()).slice(0, 5);
    
    for (const item of entries) {
      const date = new Date(item.dt * 1000);
      const dayName = days[date.getDay()];
      const weatherCode = item.weather[0].main.toLowerCase();
      
      forecast.push({
        day: dayName,
        high: Math.round(item.main.temp_max),
        low: Math.round(item.main.temp_min),
        condition: item.weather[0].main,
        icon: this.getWeatherIcon(weatherCode),
        dt: item.dt,
        humidity: item.main.humidity,
        windSpeed: Math.round(item.wind.speed * 3.6),
        pressure: item.main.pressure,
        description: item.weather[0].description,
        dateTime: item.dt_txt
      });
    }
    
    return forecast;
  }


  private getWeatherIcon(weatherMain: string): string {
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

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An unknown error occurred';
    
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Server-side error
      switch (error.status) {
        case 404:
          errorMessage = 'Location not found. Please check the spelling and try again.';
          break;
        case 401:
          errorMessage = 'Invalid API key. Please contact support.';
          break;
        case 429:
          errorMessage = 'Too many requests. Please try again later.';
          break;
        default:
          errorMessage = `Server error: ${error.status} - ${error.message}`;
      }
    }
    
    return throwError(() => new Error(errorMessage));
  }

  private getMockWeather(): Observable<WeatherData> {
    const conditions = ['Sunny', 'Partly Cloudy', 'Cloudy', 'Rainy'];
    const icons = ['☀️', '⛅', '☁️', '🌧️'];
    const randomCondition = Math.floor(Math.random() * conditions.length);
    
    const mockWeather: WeatherData = {
      temperature: Math.floor(Math.random() * 20) + 15,
      condition: conditions[randomCondition],
      humidity: Math.floor(Math.random() * 40) + 40,
      windSpeed: Math.floor(Math.random() * 20) + 5,
      icon: icons[randomCondition],
      forecast: [
        { day: 'Mon', high: 25, low: 18, condition: 'Sunny', icon: '☀️' },
        { day: 'Tue', high: 23, low: 17, condition: 'Partly Cloudy', icon: '⛅' },
        { day: 'Wed', high: 22, low: 16, condition: 'Cloudy', icon: '☁️' },
        { day: 'Thu', high: 20, low: 15, condition: 'Rainy', icon: '🌧️' },
        { day: 'Fri', high: 24, low: 17, condition: 'Sunny', icon: '☀️' }
      ]
    };

    return of(mockWeather);
  }
}
