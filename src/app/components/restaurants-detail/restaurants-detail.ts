import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { Place } from '../../services/places';
import { DataSharingService } from '../../services/data-sharing';

@Component({
  selector: 'app-restaurants-detail',
  imports: [CommonModule, RouterModule],
  templateUrl: './restaurants-detail.html',
  styleUrl: './restaurants-detail.css'
})
export class RestaurantsDetail implements OnInit {
  restaurants: Place[] = [];
  destination: string = '';
  expandedPlaces: string[] = [];

  constructor(private dataSharing: DataSharingService, private router: Router) {}

  ngOnInit(): void {
    this.dataSharing.restaurants$.subscribe(restaurants => {
      this.restaurants = restaurants;
    });
    this.dataSharing.destination$.subscribe(destination => {
      this.destination = destination;
    });
  }

  getStatusClass(openNow?: boolean): string {
    return openNow ? 'status-open' : 'status-closed';
  }

  getStatusText(openNow?: boolean): string {
    return openNow ? 'Open Now' : 'Closed';
  }

  getPriceLevel(level?: number): string {
    if (!level) return '';
    return '💲'.repeat(level);
  }

  getPlaceType(type?: string): string {
    if (!type) return '';
    return type.replace(/_/g, ' ');
  }

  getDestinationType(): string {
    const dest = this.destination.toLowerCase();
    if (dest.includes('beach') || dest.includes('coast') || dest.includes('island')) {
      return 'beach';
    } else if (dest.includes('mountain') || dest.includes('hill') || dest.includes('peak')) {
      return 'mountain';
    } else if (dest.includes('city') || dest.includes('metropolitan')) {
      return 'city';
    } else if (dest.includes('desert') || dest.includes('sahara')) {
      return 'desert';
    } else if (dest.includes('forest') || dest.includes('jungle') || dest.includes('park')) {
      return 'nature';
    }
    return 'general';
  }

  getDestinationSpecificInfo(): { title: string; description: string; icon: string }[] {
    const destType = this.getDestinationType();
    
    switch (destType) {
      case 'beach':
        return [
          { title: '🦐 Fresh Seafood', description: 'Enjoy the freshest catch and coastal cuisine', icon: '🦐' },
          { title: '🍹 Beach Bars', description: 'Relax with tropical drinks and beach vibes', icon: '🍹' }
        ];
      case 'mountain':
        return [
          { title: '🏔️ Alpine Cuisine', description: 'Taste hearty mountain food and local specialties', icon: '🏔️' },
          { title: '☕ Cozy Cafes', description: 'Warm up with hot drinks and mountain views', icon: '☕' }
        ];
      case 'city':
        return [
          { title: '🏙️ Urban Dining', description: 'Experience diverse city cuisine and trendy spots', icon: '🏙️' },
          { title: '🌃 Nightlife Eats', description: 'Discover late-night dining and street food', icon: '🌃' }
        ];
      case 'desert':
        return [
          { title: '🏜️ Desert Delights', description: 'Try traditional desert cuisine and local flavors', icon: '🏜️' },
          { title: '🌵 Oasis Dining', description: 'Dine in beautiful desert oases and resorts', icon: '🌵' }
        ];
      case 'nature':
        return [
          { title: '🌿 Organic Eateries', description: 'Enjoy farm-to-table and organic dining', icon: '🌿' },
          { title: '🦌 Local Wildlife', description: 'Try game meat and local forest specialties', icon: '🦌' }
        ];
      default:
        return [
          { title: '🍴 Foodie Paradise', description: 'Experience local cuisine and authentic flavors', icon: '🍴' },
          { title: '💰 Budget Friendly', description: 'Find great food options for every budget', icon: '💰' }
        ];
    }
  }

  getTopRestaurants(): Place[] {
    // Get top 10 restaurants sorted by rating
    return this.restaurants
      .filter(place => place.rating)
      .sort((a, b) => (b.rating || 0) - (a.rating || 0))
      .slice(0, 10);
  }

  goBack(): void {
    this.router.navigate(['/']);
  }

  toggleDetails(placeName: string): void {
    const index = this.expandedPlaces.indexOf(placeName);
    if (index > -1) {
      this.expandedPlaces.splice(index, 1);
    } else {
      this.expandedPlaces.push(placeName);
    }
  }

  isExpanded(placeName: string): boolean {
    return this.expandedPlaces.includes(placeName);
  }
}
