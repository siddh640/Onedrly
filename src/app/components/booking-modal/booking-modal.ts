import { Component, Input, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TravelBookingService } from '../../services/travel-booking.service';
import { TravelSearch, TravelResults, Location } from '../../models/travel.models';

@Component({
  selector: 'app-booking-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './booking-modal.html',
  styleUrl: './booking-modal.css'
})
export class BookingModal {
  @Input() isOpen = false;
  @Input() destinationName = '';
  @Output() closeModal = new EventEmitter<void>();

  protected origin = signal('');
  protected destination = signal('');
  protected departureDate = signal('');
  protected returnDate = signal('');
  protected passengers = signal(1);
  protected loading = signal(false);
  protected searchResults = signal<TravelResults | null>(null);
  protected showResults = signal(false);
  protected selectedTab = signal<'flights' | 'trains' | 'buses' | 'hotels' | 'rides'>('flights');

  constructor(private travelBookingService: TravelBookingService) {}

  ngOnInit() {
    // Set destination from parent component
    if (this.destinationName) {
      this.destination.set(this.destinationName);
    }

    // Set default departure date to tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    this.departureDate.set(tomorrow.toISOString().split('T')[0]);
  }

  close() {
    this.closeModal.emit();
  }

  searchTravel() {
    if (!this.origin() || !this.destination() || !this.departureDate()) {
      alert('Please fill in all required fields');
      return;
    }

    this.loading.set(true);
    this.showResults.set(false);

    // Create search object
    const search: TravelSearch = {
      origin: this.createLocation(this.origin()),
      destination: this.createLocation(this.destination()),
      departureDate: new Date(this.departureDate()),
      returnDate: this.returnDate() ? new Date(this.returnDate()) : undefined,
      passengers: this.passengers()
    };

    // Search for travel options
    this.travelBookingService.searchTravel(search).subscribe({
      next: (results) => {
        this.searchResults.set(results);
        this.showResults.set(true);
        this.loading.set(false);
        console.log('✅ Travel results:', results);
      },
      error: (error) => {
        console.error('❌ Error searching travel:', error);
        this.loading.set(false);
        alert('Error searching travel options. Please try again.');
      }
    });
  }

  private createLocation(name: string): Location {
    // Simplified - in production, would geocode
    return {
      name,
      latitude: 0,
      longitude: 0,
      city: name
    };
  }

  selectTab(tab: 'flights' | 'trains' | 'buses' | 'hotels' | 'rides') {
    this.selectedTab.set(tab);
  }

  bookItem(item: any, type: 'flight' | 'train' | 'bus' | 'hotel' | 'cab') {
    const booking = {
      type,
      travelDetails: item,
      passengers: this.passengers(),
      totalPrice: item.price * this.passengers(),
      currency: item.currency,
      departureDate: new Date(this.departureDate()),
      returnDate: this.returnDate() ? new Date(this.returnDate()) : undefined
    };

    this.travelBookingService.createBooking(booking).subscribe({
      next: (booking) => {
        alert(`✅ Booking confirmed!\nBooking Reference: ${booking.bookingReference}`);
        console.log('✅ Booking created:', booking);
      },
      error: (error) => {
        console.error('❌ Error creating booking:', error);
        alert('Error creating booking. Please try again.');
      }
    });
  }

  getResultsCount(): number {
    if (!this.searchResults()) return 0;
    const results = this.searchResults()!;
    switch (this.selectedTab()) {
      case 'flights': return results.flights.length;
      case 'trains': return results.trains.length;
      case 'buses': return results.buses.length;
      case 'hotels': return results.hotels.length;
      case 'rides': return results.rideEstimates?.length || 0;
      default: return 0;
    }
  }

  formatTime(date: Date): string {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  }

  formatPrice(price: number, currency: string = 'USD'): string {
    return this.travelBookingService.formatPrice(price, currency);
  }
}

