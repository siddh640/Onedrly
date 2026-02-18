import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';
import { BookingSummary, UserStats } from '../models/user.model';

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}

export interface SearchHistoryPayload {
  searchType: 'flight' | 'hotel' | 'train' | 'bus' | 'ride' | 'place' | 'weather' | 'package';
  searchParams: {
    origin?: Record<string, any>;
    destination?: Record<string, any>;
    departureDate?: Date | string;
    returnDate?: Date | string;
    checkInDate?: Date | string;
    checkOutDate?: Date | string;
    adults?: number;
    children?: number;
    infants?: number;
    rooms?: number;
    class?: string;
    query?: string;
  };
  resultsCount?: number;
}

interface UserStatsResponse {
  stats: UserStats;
  recentBookings: BookingSummary[];
}

export interface SearchHistoryEntry {
  _id: string;
  searchType: string;
  searchParams?: {
    destination?: {
      name?: string;
      [key: string]: any;
    };
    query?: string;
    [key: string]: any;
  };
  searchedAt: string;
}

const EMPTY_STATS: UserStats = {
  totalBookings: 0,
  totalSearches: 0,
  totalFavorites: 0,
  totalTrips: 0,
  totalReviews: 0,
  totalSpent: 0
};

@Injectable({
  providedIn: 'root'
})
export class UserDataService {
  private readonly SEARCH_HISTORY_API = `${environment.backendUrl}/search-history`;
  private readonly USER_STATS_API = `${environment.backendUrl}/users/stats`;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  logSearch(payload: SearchHistoryPayload): Observable<boolean> {
    if (!this.authService.isLoggedIn()) {
      return of(false);
    }

    return this.http.post<ApiResponse<{ search: any }>>(this.SEARCH_HISTORY_API, payload).pipe(
      map(() => true),
      catchError(() => of(false))
    );
  }

  getUserStats(): Observable<UserStatsResponse> {
    if (!this.authService.isLoggedIn()) {
      return of({ stats: EMPTY_STATS, recentBookings: [] });
    }

    return this.http.get<ApiResponse<UserStatsResponse>>(this.USER_STATS_API).pipe(
      map(response => ({
        stats: response.data?.stats || EMPTY_STATS,
        recentBookings: response.data?.recentBookings || []
      })),
      catchError(() => of({ stats: EMPTY_STATS, recentBookings: [] }))
    );
  }

  getRecentSearches(): Observable<SearchHistoryEntry[]> {
    if (!this.authService.isLoggedIn()) {
      return of([]);
    }

    return this.http.get<ApiResponse<{ searches: SearchHistoryEntry[] }>>(
      `${this.SEARCH_HISTORY_API}/recent`
    ).pipe(
      map(response => response.data?.searches || []),
      catchError(() => of([]))
    );
  }
}

