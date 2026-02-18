import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import {
  AuthenticatedUser,
  UserPreferences,
  UserProfileDetails
} from '../models/user.model';

export type User = AuthenticatedUser;

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}

interface AuthPayload {
  user: BackendUser;
  token: string;
}

interface BackendUser {
  _id?: string;
  id?: string;
  email: string;
  profile?: Partial<UserProfileDetails>;
  preferences?: Partial<UserPreferences>;
  name?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly AUTH_API = `${environment.backendUrl}/auth`;
  private readonly USER_API = `${environment.backendUrl}/users`;
  private readonly TOKEN_KEY = 'onedrly_token';
  private readonly USER_KEY = 'onedrly_user';

  private token: string | null = null;
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {
    this.restoreSession();
  }

  register(credentials: RegisterCredentials): Observable<{ success: boolean; message: string }> {
    const validationError = this.validateRegistration(credentials);
    if (validationError) {
      return of({ success: false, message: validationError });
    }

    const { firstName, lastName } = this.splitName(credentials.name);

    return this.http.post<ApiResponse<AuthPayload>>(`${this.AUTH_API}/register`, {
      email: credentials.email.trim(),
      password: credentials.password,
      firstName,
      lastName
    }).pipe(
      tap(response => {
        if (response.success && response.data) {
          this.persistSession(response.data.user, response.data.token);
        }
      }),
      map(response => ({
        success: response.success,
        message: response.message || 'Registration successful!'
      })),
      catchError(error => of({
        success: false,
        message: this.extractErrorMessage(error)
      }))
    );
  }

  login(credentials: LoginCredentials): Observable<{ success: boolean; message: string }> {
    if (!credentials.email || !credentials.password) {
      return of({ success: false, message: 'Email and password are required' });
    }

    return this.http.post<ApiResponse<AuthPayload>>(`${this.AUTH_API}/login`, {
      email: credentials.email.trim(),
      password: credentials.password
    }).pipe(
      tap(response => {
        if (response.success && response.data) {
          this.persistSession(response.data.user, response.data.token);
        }
      }),
      map(response => ({
        success: response.success,
        message: response.message || 'Login successful!'
      })),
      catchError(error => of({
        success: false,
        message: this.extractErrorMessage(error)
      }))
    );
  }

  refreshUserProfile(): Observable<User | null> {
    if (!this.token) {
      return of(null);
    }

    return this.http.get<ApiResponse<{ user: BackendUser }>>(`${this.AUTH_API}/me`).pipe(
      map(response => {
        if (response.success && response.data?.user) {
          const mappedUser = this.mapUser(response.data.user);
          this.saveUser(mappedUser);
          this.currentUserSubject.next(mappedUser);
          return mappedUser;
        }
        return null;
      }),
      catchError(() => {
        this.logout();
        return of(null);
      })
    );
  }

  updateProfile(profileUpdates: Partial<UserProfileDetails>): Observable<User | null> {
    return this.http.put<ApiResponse<{ user: BackendUser }>>(
      `${this.USER_API}/profile`,
      profileUpdates
    ).pipe(
      map(response => {
        if (response.success && response.data?.user) {
          const user = this.mapUser(response.data.user);
          this.saveUser(user);
          this.currentUserSubject.next(user);
          return user;
        }
        return this.currentUserSubject.value;
      })
    );
  }

  updatePreferences(preferences: Partial<UserPreferences>): Observable<User | null> {
    return this.http.put<ApiResponse<{ preferences: UserPreferences }>>(
      `${this.USER_API}/preferences`,
      preferences
    ).pipe(
      map(response => {
        const current = this.currentUserSubject.value;
        if (response.success && response.data?.preferences && current) {
          const updated = {
            ...current,
            preferences: {
              ...current.preferences,
              ...response.data.preferences
            }
          };
          this.saveUser(updated);
          this.currentUserSubject.next(updated);
          return updated;
        }
        return current;
      })
    );
  }

  logout(): void {
    this.token = null;
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this.currentUserSubject.next(null);
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  isLoggedIn(): boolean {
    return !!this.token;
  }

  getToken(): string | null {
    return this.token;
  }

  private restoreSession(): void {
    const storedToken = localStorage.getItem(this.TOKEN_KEY);
    const storedUser = localStorage.getItem(this.USER_KEY);

    if (storedToken) {
      this.token = storedToken;
    }

    if (storedUser) {
      try {
        const parsedUser: User = JSON.parse(storedUser);
        this.currentUserSubject.next(parsedUser);
      } catch {
        localStorage.removeItem(this.USER_KEY);
      }
    }

    if (storedToken) {
      this.refreshUserProfile().subscribe();
    }
  }

  private persistSession(user: BackendUser, token: string): void {
    this.token = token;
    localStorage.setItem(this.TOKEN_KEY, token);

    const mappedUser = this.mapUser(user);
    this.saveUser(mappedUser);
    this.currentUserSubject.next(mappedUser);
  }

  private saveUser(user: User): void {
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
  }

  private mapUser(user: BackendUser): User {
    const profile: UserProfileDetails = {
      firstName: user.profile?.firstName || '',
      lastName: user.profile?.lastName || '',
      phoneNumber: user.profile?.phoneNumber || '',
      dateOfBirth: user.profile?.dateOfBirth,
      gender: user.profile?.gender,
      bio: user.profile?.bio,
      nationality: user.profile?.nationality,
      passportNumber: user.profile?.passportNumber,
      profilePicture: user.profile?.profilePicture
    };

    const defaultPreferences: UserPreferences = {
      currency: 'USD',
      language: 'en',
      notifications: {
        email: true,
        sms: false,
        push: true
      },
      travelPreferences: {
        seatPreference: 'no-preference',
        mealPreference: 'no-preference',
        accommodationType: 'no-preference'
      }
    };

    const preferences: UserPreferences = {
      ...defaultPreferences,
      ...user.preferences,
      notifications: {
        ...defaultPreferences.notifications,
        ...user.preferences?.notifications
      },
      travelPreferences: {
        ...defaultPreferences.travelPreferences,
        ...user.preferences?.travelPreferences
      }
    };

    return {
      id: user._id || user.id || '',
      email: user.email,
      name: user.name || this.buildFullName(profile) || user.email.split('@')[0],
      profile,
      preferences
    };
  }

  private buildFullName(profile: UserProfileDetails): string {
    const parts = [profile.firstName, profile.lastName].filter(Boolean);
    return parts.join(' ').trim();
  }

  private validateRegistration(credentials: RegisterCredentials): string | null {
    if (!credentials.name.trim() || !credentials.email.trim() || !credentials.password.trim()) {
      return 'All fields are required';
    }

    if (credentials.password !== credentials.confirmPassword) {
      return 'Passwords do not match';
    }

    if (credentials.password.length < 6) {
      return 'Password must be at least 6 characters';
    }

    return null;
  }

  private splitName(name: string): { firstName: string; lastName: string } {
    const [firstName, ...rest] = name.trim().split(' ');
    return {
      firstName,
      lastName: rest.join(' ')
    };
  }

  private extractErrorMessage(error: any): string {
    if (error?.status === 0) {
      return 'Unable to reach the Onedrly API. Make sure the backend server is running and MongoDB is connected.';
    }
    if (error?.error?.message) {
      return error.error.message;
    }
    if (typeof error?.message === 'string') {
      return error.message;
    }
    return 'Something went wrong. Please try again.';
  }
}
