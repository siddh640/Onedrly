import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { Favorite } from '../models/favorite.model';
import { Place } from './places';
import { AuthService } from './auth.service';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

interface FavoritePayload {
  favoriteType: string;
  itemDetails: Favorite['itemDetails'];
  userNotes?: string;
  userTags?: string[];
}

@Injectable({
  providedIn: 'root'
})
export class FavoritesService {
  private readonly FAVORITES_API = `${environment.backendUrl}/favorites`;
  private favoritesSubject = new BehaviorSubject<Favorite[]>([]);
  favorites$ = this.favoritesSubject.asObservable();

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {
    this.authService.currentUser$.subscribe(user => {
      if (user) {
        this.loadFavorites().subscribe();
      } else {
        this.favoritesSubject.next([]);
      }
    });
  }

  loadFavorites(type?: string): Observable<Favorite[]> {
    if (!this.authService.isLoggedIn()) {
      return of([]);
    }

    const options = type ? { params: new HttpParams().set('type', type) } : {};

    return this.http.get<ApiResponse<{ favorites: Favorite[] } | Favorite[]>>(this.FAVORITES_API, options).pipe(
      map(response => {
        if (Array.isArray(response.data)) {
          return response.data;
        }
        if (response.data && 'favorites' in response.data) {
          return response.data.favorites || [];
        }
        return [];
      }),
      tap(favorites => {
        if (!type) {
          this.favoritesSubject.next(favorites);
        }
      }),
      catchError(error => {
        console.error('Error fetching favorites:', error);
        return of([]);
      })
    );
  }

  isFavorited(externalId: string): boolean {
    return this.favoritesSubject.value.some(
      favorite => favorite.itemDetails?.externalId === externalId
    );
  }

  isPlaceFavorited(place: Place): boolean {
    return this.isFavorited(this.getExternalId(place));
  }

  toggleFavorite(place: Place, category: 'attractions' | 'restaurants' | 'shopping' | 'medical' | 'destination'): Observable<boolean> {
    if (!this.authService.isLoggedIn()) {
      return throwError(() => new Error('Please login to save favorites.'));
    }

    const externalId = this.getExternalId(place);
    if (this.isFavorited(externalId)) {
      const favorite = this.favoritesSubject.value.find(f => f.itemDetails.externalId === externalId);
      return favorite ? this.removeFavorite(favorite._id).pipe(map(() => false)) : of(false);
    }

    return this.addFavorite(place, category).pipe(
      map(() => true)
    );
  }

  addFavorite(place: Place, category: 'attractions' | 'restaurants' | 'shopping' | 'medical' | 'destination'): Observable<Favorite> {
    if (!this.authService.isLoggedIn()) {
      return throwError(() => new Error('Please login to save favorites.'));
    }

    const payload: FavoritePayload = {
      favoriteType: this.mapCategoryToFavoriteType(category),
      itemDetails: {
        externalId: this.getExternalId(place),
        name: place.name,
        description: place.description,
        imageUrl: place.photos?.[0],
        location: {
          city: place.vicinity,
          address: place.address,
          country: undefined,
          coordinates: place.location ? {
            latitude: place.location.lat,
            longitude: place.location.lng
          } : undefined
        },
        rating: place.rating ? {
          value: place.rating,
          count: place.userRatingsTotal
        } : undefined,
        priceLevel: place.priceLevel,
        category: place.types,
        tags: place.types
      }
    };

    return this.http.post<ApiResponse<{ favorite: Favorite }>>(
      this.FAVORITES_API,
      payload
    ).pipe(
      map(response => {
        if (response.success && response.data?.favorite) {
          return response.data.favorite;
        }
        throw new Error(response.message || 'Failed to save favorite');
      }),
      tap(favorite => {
        this.favoritesSubject.next([favorite, ...this.favoritesSubject.value]);
      })
    );
  }

  removeFavorite(favoriteId: string): Observable<void> {
    return this.http.delete<ApiResponse<null>>(`${this.FAVORITES_API}/${favoriteId}`).pipe(
      map(response => {
        if (!response.success) {
          throw new Error(response.message || 'Failed to remove favorite');
        }
      }),
      tap(() => {
        this.favoritesSubject.next(
          this.favoritesSubject.value.filter(f => f._id !== favoriteId)
        );
      })
    );
  }

  private getExternalId(place: Place): string {
    return place.id || place.placeId || `${place.name}-${place.address || place.vicinity || ''}`;
  }

  private mapCategoryToFavoriteType(category: 'attractions' | 'restaurants' | 'shopping' | 'medical' | 'destination'): string {
    switch (category) {
      case 'restaurants':
        return 'restaurant';
      case 'shopping':
        return 'shopping';
      case 'medical':
        return 'medical';
      case 'destination':
        return 'destination';
      default:
        return 'attraction';
    }
  }
}

