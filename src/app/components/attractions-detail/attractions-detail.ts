import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { Place } from '../../services/places';
import { DataSharingService } from '../../services/data-sharing';

@Component({
  selector: 'app-attractions-detail',
  imports: [CommonModule, RouterModule],
  templateUrl: './attractions-detail.html',
  styleUrl: './attractions-detail.css'
})
export class AttractionsDetail implements OnInit {
  attractions: Place[] = [];
  destination: string = '';
  expandedPlaces: string[] = [];

  constructor(private dataSharing: DataSharingService, private router: Router) {}

  ngOnInit(): void {
    this.dataSharing.attractions$.subscribe(attractions => {
      this.attractions = attractions;
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
          { title: '🏖️ Beach Paradise', description: 'Discover stunning beaches and coastal attractions', icon: '🏖️' },
          { title: '🌊 Water Activities', description: 'Enjoy water sports and marine adventures', icon: '🌊' }
        ];
      case 'mountain':
        return [
          { title: '⛰️ Mountain Adventures', description: 'Explore peaks, hiking trails, and scenic viewpoints', icon: '⛰️' },
          { title: '🌄 Scenic Views', description: 'Capture breathtaking mountain landscapes', icon: '🌄' }
        ];
      case 'city':
        return [
          { title: '🏛️ Urban Culture', description: 'Experience city life, museums, and modern attractions', icon: '🏛️' },
          { title: '🌃 Nightlife', description: 'Discover vibrant nightlife and entertainment', icon: '🌃' }
        ];
      case 'desert':
        return [
          { title: '🏜️ Desert Wonders', description: 'Explore unique desert landscapes and oases', icon: '🏜️' },
          { title: '🌅 Sunset Views', description: 'Witness spectacular desert sunsets', icon: '🌅' }
        ];
      case 'nature':
        return [
          { title: '🌲 Nature Trails', description: 'Walk through forests and natural parks', icon: '🌲' },
          { title: '🦋 Wildlife Spotting', description: 'Observe local wildlife and biodiversity', icon: '🦋' }
        ];
      default:
        return [
          { title: '🎯 Perfect for History Lovers', description: 'Discover historical monuments, museums, and cultural sites', icon: '🎯' },
          { title: '📸 Instagram Worthy', description: 'Capture stunning photos at these iconic locations', icon: '📸' }
        ];
    }
  }

  getTopAttractions(): Place[] {
    // Get top 10 attractions sorted by rating
    return this.attractions
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
