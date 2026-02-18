export interface NotificationPreferences {
  email: boolean;
  sms: boolean;
  push: boolean;
}

export interface TravelPreferences {
  seatPreference: string;
  mealPreference: string;
  accommodationType: string;
}

export interface UserPreferences {
  currency: string;
  language: string;
  notifications: NotificationPreferences;
  travelPreferences: TravelPreferences;
}

export interface UserProfileDetails {
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  gender?: string;
  bio?: string;
  nationality?: string;
  passportNumber?: string;
  profilePicture?: string;
}

export interface UserStats {
  totalBookings: number;
  totalSearches: number;
  totalFavorites: number;
  totalTrips: number;
  totalReviews: number;
  totalSpent: number;
  memberSince?: string;
  lastLogin?: string;
}

export interface BookingSummary {
  _id: string;
  bookingType: string;
  bookingStatus: string;
  tripDetails?: {
    destination?: {
      name?: string;
    };
    departureDate?: string | Date;
  };
  pricing?: {
    totalAmount?: number;
    currency?: string;
  };
  createdAt?: string;
}

export interface AuthenticatedUser {
  id: string;
  email: string;
  name: string;
  profile: UserProfileDetails;
  preferences: UserPreferences;
}

