import { Component, Input, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TravelBookingService, BookingPayload } from '../../services/travel-booking.service';
import { TravelSearch, TravelResults, Location } from '../../models/travel.models';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

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

  constructor(
    private travelBookingService: TravelBookingService,
    private authService: AuthService,
    private router: Router
  ) {}

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
    if (!this.authService.isLoggedIn()) {
      this.promptLogin();
      return;
    }

    const payload = this.buildBookingPayload(item, type);

    this.travelBookingService.createBooking(payload).subscribe({
      next: (booking) => {
        alert(`✅ Booking confirmed!\nBooking Reference: ${booking?.bookingReference || 'Pending'}`);
        console.log('✅ Booking created:', booking);
      },
      error: (error) => {
        console.error('❌ Error creating booking:', error);
        alert(error?.error?.message || 'Error creating booking. Please try again.');
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

  private buildBookingPayload(item: any, type: 'flight' | 'train' | 'bus' | 'hotel' | 'cab'): BookingPayload {
    const passengers = this.passengers();
    const departureDate = new Date(this.departureDate());
    const returnDate = this.returnDate() ? new Date(this.returnDate()) : undefined;
    const bookingType = type === 'cab' ? 'ride' : type;

    const basePrice = item.price || item.fareEstimate?.minimum || item.fareEstimate?.maximum || 0;
    const nights = bookingType === 'hotel' ? this.calculateNights(departureDate, returnDate) : 1;
    const totalMultiplier = bookingType === 'hotel' ? nights : passengers;
    const currency = item.currency || item.fareEstimate?.currency || 'USD';

    const payload: BookingPayload = {
      bookingType: bookingType as BookingPayload['bookingType'],
      tripDetails: {
        origin: {
          name: item.origin || this.origin(),
          code: item.origin || undefined
        },
        destination: {
          name: item.destination || item.name || this.destination(),
          code: item.destination || undefined
        },
        departureDate,
        returnDate,
        tripType: returnDate ? 'round-trip' : 'one-way'
      },
      travelers: [
        {
          type: 'adult',
          firstName: 'Primary',
          lastName: 'Traveler'
        }
      ],
      pricing: {
        baseFare: basePrice,
        taxes: 0,
        fees: 0,
        discount: 0,
        totalAmount: basePrice * totalMultiplier,
        currency
      },
      payment: {
        method: 'credit-card',
        paymentStatus: 'completed',
        paidAt: new Date()
      },
      bookingStatus: 'confirmed'
    };

    if (bookingType === 'flight') {
      payload.flightDetails = {
        airline: item.airline,
        flightNumber: item.flightNumber,
        cabin: item.cabinClass,
        stops: item.stops,
        duration: item.duration,
        baggage: {
          checkedIn: '15kg',
          cabin: '7kg'
        }
      };
    }

    if (bookingType === 'hotel') {
      payload.hotelDetails = {
        hotelName: item.name,
        hotelAddress: item.address,
        checkInDate: departureDate,
        checkOutDate: returnDate || departureDate,
        nights,
        roomType: item.roomType || 'Deluxe Room',
        numberOfRooms: 1,
        guests: passengers,
        amenities: item.amenities || []
      };
    }

    if (bookingType === 'train' || bookingType === 'bus') {
      payload.transportDetails = {
        operatorName: item.operator || item.trainName,
        vehicleNumber: item.busNumber || item.trainNumber,
        class: item.class,
        departureTime: item.departureTime,
        arrivalTime: item.arrivalTime,
        seatNumbers: []
      };
    }

    if (bookingType === 'ride') {
      payload.rideDetails = {
        provider: item.displayName || 'Ride Share',
        vehicleType: item.service,
        pickupLocation: this.origin(),
        dropoffLocation: this.destination(),
        pickupTime: departureDate
      };
    }

    return payload;
  }

  private calculateNights(checkIn: Date, checkOut?: Date): number {
    if (!checkOut) {
      return 1;
    }
    const diff = Math.abs(checkOut.getTime() - checkIn.getTime());
    const nights = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return nights || 1;
  }

  protected get isAuthenticated(): boolean {
    return this.authService.isLoggedIn();
  }

  protected goToLogin(): void {
    this.navigateToAuth('/login');
  }

  protected goToRegister(): void {
    this.navigateToAuth('/register');
  }

  private promptLogin(): void {
    const confirmLogin = confirm('Please sign in to continue with your booking. Would you like to sign in now?');
    if (confirmLogin) {
      this.goToLogin();
    }
  }

  private navigateToAuth(route: '/login' | '/register'): void {
    const returnUrl = this.router.url || '/';
    this.router.navigate([route], { queryParams: { returnUrl } });
  }
}

