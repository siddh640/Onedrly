import { Component, signal, OnInit, computed } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { SearchBar } from './components/search-bar/search-bar';
import { Results } from './components/results/results';
import { Places, DestinationData } from './services/places';
import { Weather, WeatherData } from './services/weather';
import { AuthService, User } from './services/auth.service';
import { UserDataService } from './services/user-data.service';
import { TripPlanner } from './components/trip-planner/trip-planner';
import { EmergencyWidget } from './components/emergency-widget/emergency-widget';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CommonModule, SearchBar, Results, TripPlanner, EmergencyWidget],
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
  protected readonly theme = signal<'light' | 'dark'>(this.getInitialTheme());
  protected readonly activeDestination = computed(() => this.destinationData()?.destination || '');
  protected readonly currentPage = signal<string>('home');

  constructor(
    private placesService: Places,
    private weatherService: Weather,
    private authService: AuthService,
    private userDataService: UserDataService,
    private router: Router
  ) {
    // Track current page based on route
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        const url = this.router.url;
        if (url.includes('/onedrly-ai')) {
          this.currentPage.set('ai');
        } else if (url.includes('/weather')) {
          this.currentPage.set('weather');
        } else if (url.includes('/bookings')) {
          this.currentPage.set('bookings');
        } else if (url.includes('/trip-planner')) {
          this.currentPage.set('planner');
        } else if (url === '/' || url === '') {
          this.currentPage.set('home');
        }
      });
  }

  ngOnInit(): void {
    this.applyTheme(this.theme());
    this.authService.currentUser$.subscribe(user => {
      this.currentUser.set(user);
    });
  }

  handleSearch(destination: string): void {
    this.loading.set(true);
    this.searched.set(true);
    this.trackSearch(destination);

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

  private trackSearch(destination: string): void {
    this.userDataService.logSearch({
      searchType: 'place',
      searchParams: {
        destination: { name: destination },
        query: destination
      }
    }).subscribe();
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

  goToHome(): void {
    this.router.navigate(['/']);
    this.currentPage.set('home');
  }

  goToOnedrlyAi(): void {
    this.router.navigate(['/onedrly-ai']);
    this.currentPage.set('ai');
  }

  goToWeather(): void {
    this.router.navigate(['/weather']);
    this.currentPage.set('weather');
  }

  goToBookings(): void {
    this.router.navigate(['/bookings']);
    this.currentPage.set('bookings');
  }

  goToTripPlanner(): void {
    this.router.navigate(['/trip-planner']);
    this.currentPage.set('planner');
  }

  logout(): void {
    this.authService.logout();
  }

  isAuthPage(): boolean {
    const currentUrl = this.router.url;
    return currentUrl.includes('/login') || currentUrl.includes('/register');
  }

  isAiPage(): boolean {
    return this.router.url.includes('/onedrly-ai');
  }

  toggleTheme(): void {
    const next = this.theme() === 'light' ? 'dark' : 'light';
    this.theme.set(next);
    this.applyTheme(next);
    try {
      localStorage.setItem('onedrly_theme', next);
    } catch {
      // ignore storage failures (private mode, etc.)
    }
  }

  private applyTheme(theme: 'light' | 'dark'): void {
    document.documentElement.setAttribute('data-theme', theme);
  }

  private getInitialTheme(): 'light' | 'dark' {
    if (typeof window === 'undefined') {
      return 'light';
    }
    try {
      const saved = localStorage.getItem('onedrly_theme');
      if (saved === 'light' || saved === 'dark') {
        return saved;
      }
    } catch {
      // ignore errors and fall back to system preference
    }
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  }
}
