import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of, forkJoin } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { RequestOptimizerService } from './request-optimizer.service';
import {
  TravelSearch,
  TravelResults,
  Flight,
  Train,
  Bus,
  Hotel,
  RideEstimate,
  Booking
} from '../models/travel.models';

@Injectable({
  providedIn: 'root'
})
export class TravelBookingService {
  private readonly API_BASE_URL = 'http://localhost:3000/api';
  private amadeusToken: string = '';

  constructor(
    private http: HttpClient,
    private requestOptimizer: RequestOptimizerService
  ) {
    // Initialize Amadeus if configured
    if (environment.amadeus.enabled) {
      this.getAmadeusToken();
    }
  }

  /**
   * Search for all travel options (flights, trains, buses, hotels)
   */
  searchTravel(search: TravelSearch): Observable<TravelResults> {
    console.log('🔍 Searching travel options:', search);

    // Use parallel API calls for better performance
    return forkJoin({
      flights: this.searchFlights(search),
      trains: this.searchTrains(search),
      buses: this.searchBuses(search),
      hotels: this.searchHotels(search),
      rideEstimates: this.getRideEstimates(search)
    }).pipe(
      map(results => {
        console.log('✅ Travel search completed:', results);
        return results;
      }),
      catchError(error => {
        console.error('❌ Travel search failed:', error);
        // Return mock data as fallback
        return of(this.getMockTravelResults(search));
      })
    );
  }

  /**
   * Get Amadeus access token
   */
  private getAmadeusToken(): void {
    if (!environment.amadeus.enabled) return;

    const url = `${environment.amadeus.baseUrl}/v1/security/oauth2/token`;
    const body = new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: environment.amadeus.clientId,
      client_secret: environment.amadeus.clientSecret
    });

    const headers = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded'
    });

    this.http.post<any>(url, body.toString(), { headers }).subscribe({
      next: (response) => {
        this.amadeusToken = response.access_token;
        console.log('✅ Amadeus API connected! Real-time flight data enabled.');
      },
      error: (error) => {
        console.warn('⚠️ Amadeus API not configured. Using enhanced mock data.');
        console.log('💡 See API_SETUP_GUIDE.md to enable real-time flight data.');
      }
    });
  }

  /**
   * Search for flights via backend API with caching and deduplication
   */
  searchFlights(search: TravelSearch): Observable<Flight[]> {
    // Create cache key based on search parameters
    const cacheKey = `flights_${search.origin.city || search.origin.name}_${search.destination.city || search.destination.name}_${search.departureDate}_${search.passengers}`;
    
    // Use request optimizer for caching and deduplication
    return this.requestOptimizer.optimizedRequest(
      cacheKey,
      () => this.http.post<any>(`${this.API_BASE_URL}/flights/search`, {
        origin: search.origin.city || search.origin.name,
        destination: search.destination.city || search.destination.name,
        departureDate: search.departureDate,
        passengers: search.passengers
      }).pipe(
        map(response => response.data || []),
        catchError((error) => {
          console.warn('Backend flight API error, using local mock:', error);
          return of(this.getEnhancedMockFlights(search));
        })
      ),
      5 * 60 * 1000 // Cache for 5 minutes
    );
  }

  /**
   * Search real flights using Amadeus API
   */
  private searchRealFlights(search: TravelSearch): Observable<Flight[]> {
    const url = `${environment.amadeus.baseUrl}/v2/shopping/flight-offers`;
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.amadeusToken}`
    });

    const params = {
      originLocationCode: this.getAirportCode(search.origin.city || search.origin.name),
      destinationLocationCode: this.getAirportCode(search.destination.city || search.destination.name),
      departureDate: this.formatDate(search.departureDate),
      adults: search.passengers.toString(),
      max: '10'
    };

    return this.http.get<any>(url, { headers, params }).pipe(
      map((response) => this.transformAmadeusFlights(response))
    );
  }

  /**
   * Transform Amadeus API response to our Flight model
   */
  private transformAmadeusFlights(response: any): Flight[] {
    if (!response.data || !response.data.length) return [];

    return response.data.slice(0, 6).map((offer: any, index: number) => {
      const segment = offer.itineraries[0].segments[0];
      const price = parseFloat(offer.price.total) * 80; // Convert to INR approx

      return {
        id: offer.id,
        airline: segment.carrierCode,
        flightNumber: `${segment.carrierCode}${segment.number}`,
        origin: segment.departure.iataCode,
        destination: segment.arrival.iataCode,
        departureTime: new Date(segment.departure.at),
        arrivalTime: new Date(segment.arrival.at),
        duration: offer.itineraries[0].duration,
        price: Math.round(price),
        currency: 'INR',
        stops: offer.itineraries[0].segments.length - 1,
        available: true,
        cabinClass: segment.cabin || 'Economy'
      };
    });
  }

  /**
   * Get airport code from city name
   */
  private getAirportCode(city: string): string {
    const codes: { [key: string]: string } = {
      'new york': 'JFK', 'newyork': 'JFK', 'nyc': 'JFK',
      'los angeles': 'LAX', 'la': 'LAX',
      'london': 'LHR',
      'paris': 'CDG',
      'tokyo': 'NRT',
      'dubai': 'DXB',
      'singapore': 'SIN',
      'mumbai': 'BOM',
      'delhi': 'DEL',
      'bangalore': 'BLR',
      'chennai': 'MAA',
      'kolkata': 'CCU',
      'hyderabad': 'HYD',
      'pune': 'PNQ',
      'goa': 'GOI',
      'jaipur': 'JAI',
      'ahmedabad': 'AMD'
    };

    return codes[city.toLowerCase()] || 'DEL'; // Default to Delhi
  }

  /**
   * Search for trains via backend API with caching and deduplication
   */
  searchTrains(search: TravelSearch): Observable<Train[]> {
    const cacheKey = `trains_${search.origin.city || search.origin.name}_${search.destination.city || search.destination.name}_${search.departureDate}`;
    
    return this.requestOptimizer.optimizedRequest(
      cacheKey,
      () => this.http.post<any>(`${this.API_BASE_URL}/trains/search`, {
        origin: search.origin.city || search.origin.name,
        destination: search.destination.city || search.destination.name,
        departureDate: search.departureDate,
        passengers: search.passengers
      }).pipe(
        map(response => response.data || []),
        catchError((error) => {
          console.warn('Backend train API error, using local mock:', error);
          return of(this.getMockTrains(search));
        })
      ),
      5 * 60 * 1000 // Cache for 5 minutes
    );
  }

  /**
   * Search for buses via backend API with caching and deduplication
   */
  searchBuses(search: TravelSearch): Observable<Bus[]> {
    const cacheKey = `buses_${search.origin.city || search.origin.name}_${search.destination.city || search.destination.name}_${search.departureDate}`;
    
    return this.requestOptimizer.optimizedRequest(
      cacheKey,
      () => this.http.post<any>(`${this.API_BASE_URL}/buses/search`, {
        origin: search.origin.city || search.origin.name,
        destination: search.destination.city || search.destination.name,
        departureDate: search.departureDate,
        passengers: search.passengers
      }).pipe(
        map(response => response.data || []),
        catchError((error) => {
          console.warn('Backend bus API error, using local mock:', error);
          return of(this.getMockBuses(search));
        })
      ),
      5 * 60 * 1000 // Cache for 5 minutes
    );
  }

  /**
   * Search for hotels via backend API with caching and deduplication
   */
  searchHotels(search: TravelSearch): Observable<Hotel[]> {
    const cacheKey = `hotels_${search.destination.city || search.destination.name}_${search.departureDate}_${search.returnDate}_${search.passengers}`;
    
    return this.requestOptimizer.optimizedRequest(
      cacheKey,
      () => this.http.post<any>(`${this.API_BASE_URL}/hotels/search`, {
        destination: search.destination.city || search.destination.name,
        checkIn: search.departureDate,
        checkOut: search.returnDate,
        guests: search.passengers
      }).pipe(
        map(response => response.data || []),
        catchError((error) => {
          console.warn('Backend hotel API error, using local mock:', error);
          return of(this.getMockHotels(search));
        })
      ),
      5 * 60 * 1000 // Cache for 5 minutes
    );
  }

  /**
   * Get ride estimates via backend API
   */
  getRideEstimates(search: TravelSearch): Observable<RideEstimate[]> {
    return this.http.post<any>(`${this.API_BASE_URL}/rides/estimate`, {
      origin: search.origin.city || search.origin.name,
      destination: search.destination.city || search.destination.name
    }).pipe(
      map(response => response.data || []),
      catchError((error) => {
        console.warn('Backend ride API error, using local mock:', error);
        return of(this.getMockRideEstimates(search));
      })
    );
  }

  /**
   * Create a booking
   */
  createBooking(booking: Partial<Booking>): Observable<Booking> {
    // In production, this would call the backend API
    const newBooking: Booking = {
      id: this.generateBookingId(),
      userId: 'current-user-id', // Would come from auth service
      bookingReference: this.generateBookingReference(),
      status: 'confirmed',
      bookingDate: new Date(),
      ...booking
    } as Booking;

    console.log('✅ Booking created:', newBooking);
    return of(newBooking);
  }

  /**
   * Get user's bookings
   */
  getUserBookings(userId: string): Observable<Booking[]> {
    // Mock data - in production would call API
    return of([]);
  }

  // ==================== MOCK DATA GENERATORS ====================

  private getMockTravelResults(search: TravelSearch): TravelResults {
    return {
      flights: this.getEnhancedMockFlights(search),
      trains: this.getMockTrains(search),
      buses: this.getMockBuses(search),
      hotels: this.getMockHotels(search),
      rideEstimates: this.getMockRideEstimates(search)
    };
  }

  /**
   * Enhanced mock flights with dynamic pricing and realistic data
   */
  private getEnhancedMockFlights(search: TravelSearch): Flight[] {
    const airlines = [
      { name: 'Air India', prefix: 'AI' },
      { name: 'IndiGo', prefix: 'IG' },
      { name: 'SpiceJet', prefix: 'SJ' },
      { name: 'Vistara', prefix: 'VT' },
      { name: 'Emirates', prefix: 'EK' },
      { name: 'Singapore Airlines', prefix: 'SQ' }
    ];

    const cabinClasses = ['Economy', 'Premium Economy', 'Business', 'First Class'];
    
    return airlines.map((airline, index) => {
      const departureTime = new Date(search.departureDate);
      departureTime.setHours(6 + index * 2, 0, 0);
      
      const arrivalTime = new Date(departureTime);
      arrivalTime.setHours(arrivalTime.getHours() + 2 + index);
      
      const duration = `${2 + index}h ${Math.floor(Math.random() * 60)}m`;
      
      // Dynamic pricing based on date, demand, and airline
      const basePriceVariation = this.getDaysUntilDeparture(search.departureDate);
      const demandMultiplier = this.getDemandMultiplier(search.origin, search.destination);
      const basePrice = 5000 + (index * 1000);
      const price = Math.round(basePrice * basePriceVariation * demandMultiplier + Math.floor(Math.random() * 2000));

      return {
        id: `flight-${index + 1}`,
        airline: airline.name,
        flightNumber: `${airline.prefix}${100 + index * 100}`,
        origin: search.origin.city || search.origin.name,
        destination: search.destination.city || search.destination.name,
        departureTime,
        arrivalTime,
        duration,
        price,
        currency: 'INR',
        stops: index % 3 === 0 ? 0 : 1,
        available: true,
        cabinClass: cabinClasses[index % cabinClasses.length]
      };
    });
  }

  private getMockTrains(search: TravelSearch): Train[] {
    const trains = [
      { name: 'Rajdhani Express', number: '12301' },
      { name: 'Shatabdi Express', number: '12002' },
      { name: 'Duronto Express', number: '12213' },
      { name: 'Vande Bharat', number: '22435' }
    ];

    const classes = ['Sleeper', 'AC 3-Tier', 'AC 2-Tier', 'AC 1st Class'];

    return trains.map((train, index) => {
      const departureTime = new Date(search.departureDate);
      departureTime.setHours(7 + index * 3, 30, 0);
      
      const arrivalTime = new Date(departureTime);
      arrivalTime.setHours(arrivalTime.getHours() + 6 + index * 2);
      
      const duration = `${6 + index * 2}h ${30}m`;
      const price = 500 + (index * 300);

      return {
        id: `train-${index + 1}`,
        trainNumber: train.number,
        trainName: train.name,
        origin: search.origin.city || search.origin.name,
        destination: search.destination.city || search.destination.name,
        departureTime,
        arrivalTime,
        duration,
        price,
        currency: 'INR',
        available: true,
        class: classes[index % classes.length],
        seatsAvailable: 50 + Math.floor(Math.random() * 100)
      };
    });
  }

  private getMockBuses(search: TravelSearch): Bus[] {
    const operators = [
      { name: 'RedBus Express', type: 'AC Sleeper' },
      { name: 'Volvo Luxury', type: 'AC Seater' },
      { name: 'Mercedes Comfort', type: 'Semi-Sleeper' },
      { name: 'Scania Premium', type: 'AC Sleeper' }
    ];

    return operators.map((operator, index) => {
      const departureTime = new Date(search.departureDate);
      departureTime.setHours(20 + index, 0, 0);
      
      const arrivalTime = new Date(departureTime);
      arrivalTime.setHours(arrivalTime.getHours() + 8 + index);
      
      const duration = `${8 + index}h ${Math.floor(Math.random() * 60)}m`;
      const price = 800 + (index * 200);

      return {
        id: `bus-${index + 1}`,
        operator: operator.name,
        busNumber: `BUS${1000 + index * 100}`,
        origin: search.origin.city || search.origin.name,
        destination: search.destination.city || search.destination.name,
        departureTime,
        arrivalTime,
        duration,
        price,
        currency: 'INR',
        available: true,
        busType: operator.type,
        seatsAvailable: 30 + Math.floor(Math.random() * 20),
        amenities: ['WiFi', 'AC', 'Charging Points', 'Water Bottle', 'Blanket']
      };
    });
  }

  private getMockHotels(search: TravelSearch): Hotel[] {
    const hotels = [
      { name: 'Grand Plaza Hotel', stars: 5 },
      { name: 'City Center Inn', stars: 4 },
      { name: 'Budget Stay', stars: 3 },
      { name: 'Luxury Suites', stars: 5 },
      { name: 'Comfort Lodge', stars: 3 }
    ];

    return hotels.map((hotel, index) => ({
      id: `hotel-${index + 1}`,
      name: hotel.name,
      address: `${123 + index} Main Street, ${search.destination.city || search.destination.name}`,
      location: search.destination,
      rating: 3.5 + (Math.random() * 1.5),
      starRating: hotel.stars,
      price: 100 + (hotel.stars * 50) + (index * 20),
      currency: 'INR',
      amenities: ['WiFi', 'Breakfast', 'Pool', 'Gym', 'Spa', 'Restaurant', 'Room Service'],
      images: ['https://via.placeholder.com/400x300'],
      description: `Beautiful ${hotel.stars}-star hotel in the heart of ${search.destination.city || search.destination.name}`,
      reviews: 1000 + Math.floor(Math.random() * 2000),
      distanceFromCenter: 0.5 + (Math.random() * 3),
      availability: true,
      roomType: 'Deluxe Room',
      cancellationPolicy: 'Free cancellation up to 24 hours before check-in'
    }));
  }

  private getMockRideEstimates(search: TravelSearch): RideEstimate[] {
    const services = [
      { service: 'uber_x', name: 'UberX', multiplier: 1 },
      { service: 'uber_xl', name: 'UberXL', multiplier: 1.5 },
      { service: 'uber_comfort', name: 'Uber Comfort', multiplier: 1.3 },
      { service: 'uber_black', name: 'Uber Black', multiplier: 2 }
    ];

    const basePrice = 20;
    const distance = 15 + Math.random() * 35; // km
    const duration = Math.floor(distance * 2); // minutes

    return services.map(s => ({
      service: s.service,
      displayName: s.name,
      estimate: `${Math.floor(duration)} min`,
      fareEstimate: {
        minimum: Math.floor(basePrice * s.multiplier * 0.8),
        maximum: Math.floor(basePrice * s.multiplier * 1.2),
        currency: 'INR'
      },
      duration,
      distance
    }));
  }

  // ==================== HELPER METHODS ====================

  private generateBookingId(): string {
    return 'BK' + Date.now() + Math.random().toString(36).substr(2, 9).toUpperCase();
  }

  private generateBookingReference(): string {
    return 'WDR' + Date.now().toString(36).toUpperCase();
  }

  /**
   * Format price with currency symbol
   */
  formatPrice(price: number, currency: string = 'INR'): string {
    const symbols: { [key: string]: string } = {
      USD: '$',
      EUR: '€',
      GBP: '£',
      INR: '₹',
      JPY: '¥'
    };

    return `${symbols[currency] || currency} ${price.toLocaleString()}`;
  }

  /**
   * Format duration
   */
  formatDuration(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  }

  /**
   * Calculate days until departure (for dynamic pricing)
   */
  private getDaysUntilDeparture(departureDate: Date): number {
    const now = new Date();
    const departure = new Date(departureDate);
    const days = Math.floor((departure.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    // Pricing multiplier based on booking advance
    if (days < 3) return 1.5; // Last minute - expensive
    if (days < 7) return 1.3;
    if (days < 14) return 1.1;
    if (days < 30) return 1.0; // Sweet spot
    if (days < 60) return 0.9;
    return 0.8; // Early bird discount
  }

  /**
   * Calculate demand multiplier based on route popularity
   */
  private getDemandMultiplier(origin: any, destination: any): number {
    const popularRoutes = [
      'mumbai-delhi', 'delhi-mumbai',
      'bangalore-mumbai', 'mumbai-bangalore',
      'delhi-bangalore', 'bangalore-delhi',
      'new york-london', 'london-new york',
      'paris-london', 'london-paris'
    ];

    const route = `${(origin.city || origin.name).toLowerCase()}-${(destination.city || destination.name).toLowerCase()}`;
    const isPopular = popularRoutes.some(r => route.includes(r.split('-')[0]) && route.includes(r.split('-')[1]));
    
    return isPopular ? 1.2 : 1.0;
  }

  /**
   * Format date for API calls
   */
  private formatDate(date: Date): string {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}


