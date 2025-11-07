import { Component, input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { DestinationData, Place } from '../../services/places';
import { WeatherData } from '../../services/weather';
import { DataSharingService } from '../../services/data-sharing';
import { WeatherDetail } from '../weather-detail/weather-detail';
import { BookingModal } from '../booking-modal/booking-modal';

@Component({
  selector: 'app-results',
  imports: [CommonModule, RouterModule, WeatherDetail, BookingModal],
  templateUrl: './results.html',
  styleUrl: './results.css'
})
export class Results {
  destinationData = input<DestinationData | null>(null);
  weatherData = input<WeatherData | null>(null);
  loading = input<boolean>(false);
  
  protected showBookingModal = signal(false);
  protected showDetailsModal = signal(false);
  protected selectedCategory = signal<'attractions' | 'restaurants' | 'shopping' | null>(null);
  protected selectedPlaces = signal<Place[]>([]);

  // Preview limit
  readonly PREVIEW_LIMIT = 10;

  constructor(private router: Router, private dataSharing: DataSharingService) {}

  get hasData(): boolean {
    return this.destinationData() !== null;
  }

  get attractionsToShow(): Place[] {
    const attractions = this.destinationData()?.attractions || [];
    return attractions.slice(0, this.PREVIEW_LIMIT);
  }

  get restaurantsToShow(): Place[] {
    const restaurants = this.destinationData()?.restaurants || [];
    return restaurants.slice(0, this.PREVIEW_LIMIT);
  }

  get shoppingToShow(): Place[] {
    const shopping = this.destinationData()?.shopping || [];
    return shopping.slice(0, this.PREVIEW_LIMIT);
  }


  getTopPlaces(places: Place[]): Place[] {
    // First try to get places with ratings, sorted by rating
    const ratedPlaces = places
      .filter(place => place.rating)
      .sort((a, b) => (b.rating || 0) - (a.rating || 0));
    
    // If we have 10 or more rated places, return top 10
    if (ratedPlaces.length >= 10) {
      return ratedPlaces.slice(0, 10);
    }
    
    // If we have fewer than 10 rated places, add unrated places to reach 10
    const unratedPlaces = places
      .filter(place => !place.rating)
      .slice(0, 10 - ratedPlaces.length);
    
    return [...ratedPlaces, ...unratedPlaces].slice(0, 10);
  }

  viewAllAttractions(): void {
    const destination = this.destinationData()?.destination || '';
    const attractions = this.destinationData()?.attractions || [];
    this.dataSharing.setDestination(destination);
    this.dataSharing.setAttractions(attractions);
    this.router.navigate(['/attractions', destination]);
  }

  viewAllRestaurants(): void {
    const destination = this.destinationData()?.destination || '';
    const restaurants = this.destinationData()?.restaurants || [];
    this.dataSharing.setDestination(destination);
    this.dataSharing.setRestaurants(restaurants);
    this.router.navigate(['/restaurants', destination]);
  }

  viewAllShopping(): void {
    const destination = this.destinationData()?.destination || '';
    const shopping = this.destinationData()?.shopping || [];
    this.dataSharing.setDestination(destination);
    this.dataSharing.setShopping(shopping);
    this.router.navigate(['/shopping', destination]);
  }

  getPriceLevel(level?: number): string {
    if (!level) return '';
    return '💲'.repeat(level);
  }

  getStatusClass(openNow?: boolean): string {
    return openNow ? 'status-open' : 'status-closed';
  }

  getStatusText(openNow?: boolean): string {
    return openNow ? 'Open Now' : 'Closed';
  }

  onColumnClick(category: 'attractions' | 'restaurants' | 'shopping'): void {
    // Add visual feedback
    this.showColumnFeedback(category);
    
    // Show details modal with places
    this.selectedCategory.set(category);
    
    let places: Place[] = [];
    switch (category) {
      case 'attractions':
        places = this.destinationData()?.attractions || [];
        break;
      case 'restaurants':
        places = this.destinationData()?.restaurants || [];
        break;
      case 'shopping':
        places = this.destinationData()?.shopping || [];
        break;
    }
    
    this.selectedPlaces.set(places);
    this.showDetailsModal.set(true);
  }
  
  closeDetailsModal(): void {
    this.showDetailsModal.set(false);
    this.selectedCategory.set(null);
    this.selectedPlaces.set([]);
  }
  
  getCategoryIcon(category: string | null): string {
    switch (category) {
      case 'attractions': return '🏛️';
      case 'restaurants': return '🍽️';
      case 'shopping': return '🛍️';
      default: return '📍';
    }
  }
  
  getCategoryTitle(category: string | null): string {
    switch (category) {
      case 'attractions': return 'Tourist Attractions';
      case 'restaurants': return 'Restaurants & Dining';
      case 'shopping': return 'Shopping & Malls';
      default: return 'Places';
    }
  }
  
  getPriceLevelText(level?: number): string {
    if (!level) return '';
    return '₹'.repeat(level);
  }
  
  truncateDescription(description?: string, maxLength: number = 150): string {
    if (!description) return '';
    if (description.length <= maxLength) return description;
    return description.substring(0, maxLength) + '...';
  }

  private showColumnFeedback(category: string): void {
    // Add a subtle animation or highlight effect
    const column = document.querySelector(`[data-category="${category}"]`);
    if (column) {
      column.classList.add('column-clicked');
      setTimeout(() => {
        column.classList.remove('column-clicked');
      }, 300);
    }
  }

  openBookingModal(): void {
    this.showBookingModal.set(true);
  }

  closeBookingModal(): void {
    this.showBookingModal.set(false);
  }
}
