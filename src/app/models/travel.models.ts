export interface Location {
  name: string;
  latitude: number;
  longitude: number;
  country?: string;
  city?: string;
}

export interface TravelSearch {
  origin: Location;
  destination: Location;
  departureDate: Date;
  returnDate?: Date;
  passengers: number;
}

export interface Flight {
  id: string;
  airline: string;
  flightNumber: string;
  origin: string;
  destination: string;
  departureTime: Date;
  arrivalTime: Date;
  duration: string;
  price: number;
  currency: string;
  stops: number;
  available: boolean;
  cabinClass: string;
}

export interface Train {
  id: string;
  trainNumber: string;
  trainName: string;
  origin: string;
  destination: string;
  departureTime: Date;
  arrivalTime: Date;
  duration: string;
  price: number;
  currency: string;
  available: boolean;
  class: string;
  seatsAvailable: number;
}

export interface Bus {
  id: string;
  operator: string;
  busNumber: string;
  origin: string;
  destination: string;
  departureTime: Date;
  arrivalTime: Date;
  duration: string;
  price: number;
  currency: string;
  available: boolean;
  busType: string;
  seatsAvailable: number;
  amenities: string[];
}

export interface Hotel {
  id: string;
  name: string;
  address: string;
  location: Location;
  rating: number;
  starRating: number;
  price: number;
  currency: string;
  amenities: string[];
  images: string[];
  description: string;
  reviews: number;
  distanceFromCenter: number;
  availability: boolean;
  roomType: string;
  cancellationPolicy: string;
}

export interface RideEstimate {
  service: string;
  displayName: string;
  estimate: string;
  fareEstimate: {
    minimum: number;
    maximum: number;
    currency: string;
  };
  duration: number;
  distance: number;
}

export interface TravelResults {
  flights: Flight[];
  trains: Train[];
  buses: Bus[];
  hotels: Hotel[];
  rideEstimates?: RideEstimate[];
}

export interface Booking {
  id: string;
  userId: string;
  type: 'flight' | 'train' | 'bus' | 'hotel' | 'cab';
  bookingReference: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  travelDetails: Flight | Train | Bus | Hotel | RideEstimate;
  passengers: number;
  totalPrice: number;
  currency: string;
  bookingDate: Date;
  departureDate: Date;
  returnDate?: Date;
}
