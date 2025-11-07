import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { Place } from '../../services/places';
import { DataSharingService } from '../../services/data-sharing';

@Component({
  selector: 'app-shopping-detail',
  imports: [CommonModule, RouterModule],
  templateUrl: './shopping-detail.html',
  styleUrl: './shopping-detail.css'
})
export class ShoppingDetail implements OnInit {
  shopping: Place[] = [];
  destination: string = '';
  expandedPlaces: string[] = [];

  constructor(private dataSharing: DataSharingService, private router: Router) {}

  ngOnInit(): void {
    this.dataSharing.shopping$.subscribe(shopping => {
      this.shopping = shopping;
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
          { title: '🏖️ Beach Souvenirs', description: 'Find unique coastal gifts and beach accessories', icon: '🏖️' },
          { title: '🐚 Local Crafts', description: 'Discover handmade items and local artisan work', icon: '🐚' }
        ];
      case 'mountain':
        return [
          { title: '⛰️ Outdoor Gear', description: 'Shop for hiking equipment and mountain gear', icon: '⛰️' },
          { title: '🧗 Adventure Stores', description: 'Find everything for your mountain adventures', icon: '🧗' }
        ];
      case 'city':
        return [
          { title: '🏙️ Urban Shopping', description: 'Explore modern malls and trendy boutiques', icon: '🏙️' },
          { title: '🛍️ Fashion Districts', description: 'Discover the latest fashion and designer stores', icon: '🛍️' }
        ];
      case 'desert':
        return [
          { title: '🏜️ Desert Treasures', description: 'Find unique desert artifacts and traditional items', icon: '🏜️' },
          { title: '🌵 Oasis Markets', description: 'Shop in beautiful desert oases and local markets', icon: '🌵' }
        ];
      case 'nature':
        return [
          { title: '🌿 Eco-Friendly Stores', description: 'Shop for sustainable and organic products', icon: '🌿' },
          { title: '🦋 Nature Souvenirs', description: 'Find wildlife-themed gifts and nature crafts', icon: '🦋' }
        ];
      default:
        return [
          { title: '🛒 Shopaholic\'s Dream', description: 'Find everything from local crafts to international brands', icon: '🛒' },
          { title: '🎁 Perfect for Souvenirs', description: 'Take home unique gifts and memorable items', icon: '🎁' }
        ];
    }
  }

  getTopShopping(): Place[] {
    // Get top 10 shopping places sorted by rating
    return this.shopping
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
