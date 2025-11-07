import { Component, signal, OnInit } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SearchBar } from './components/search-bar/search-bar';
import { Results } from './components/results/results';
import { Places, DestinationData } from './services/places';
import { Weather, WeatherData } from './services/weather';
import { AuthService, User } from './services/auth.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CommonModule, SearchBar, Results],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  protected readonly title = signal('Onedrly');
  protected readonly destinationData = signal<DestinationData | null>(null);
  protected readonly weatherData = signal<WeatherData | null>(null);
  protected readonly loading = signal<boolean>(false);
  protected readonly searched = signal<boolean>(false);
  protected readonly currentUser = signal<User | null>(null);

  constructor(
    private placesService: Places,
    private weatherService: Weather,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser.set(user);
    });
  }

  handleSearch(destination: string): void {
    this.loading.set(true);
    this.searched.set(true);

    // Fetch destination data
    this.placesService.searchDestination(destination).subscribe({
      next: (data) => {
        this.destinationData.set(data);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error fetching destination data:', error);
        this.loading.set(false);
      }
    });

    // Fetch weather data with enhanced forecast
    this.weatherService.getWeather(destination).subscribe({
      next: (weatherData) => {
        // Fetch 5-day forecast and merge with weather data
        this.weatherService.getForecast(destination).subscribe({
          next: (forecastData) => {
            // Transform forecast data and add to weather data
            const forecastArray = this.weatherService.transformForecastData(forecastData);
            weatherData.forecast = forecastArray;
            this.weatherData.set(weatherData);
          },
          error: (error) => {
            console.error('Error fetching forecast data:', error);
            // Still set weather data even if forecast fails
            this.weatherData.set(weatherData);
          }
        });
      },
      error: (error) => {
        console.error('Error fetching weather data:', error);
      }
    });
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }

  goToRegister(): void {
    this.router.navigate(['/register']);
  }

  goToProfile(): void {
    this.router.navigate(['/profile']);
  }

  logout(): void {
    this.authService.logout();
  }

  isAuthPage(): boolean {
    const currentUrl = this.router.url;
    return currentUrl.includes('/login') || currentUrl.includes('/register');
  }
}
