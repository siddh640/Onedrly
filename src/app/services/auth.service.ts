import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface User {
  id: string;
  email: string;
  name: string;
  preferences: {
    favoriteDestinations: string[];
    preferredCategories: string[];
  };
}

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

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor() {
    // Check for existing session on service initialization
    this.checkExistingSession();
  }

  private checkExistingSession(): void {
    const savedUser = localStorage.getItem('wandrly_user');
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser);
        this.currentUserSubject.next(user);
      } catch (error) {
        localStorage.removeItem('wandrly_user');
      }
    }
  }

  register(credentials: RegisterCredentials): Observable<{ success: boolean; message: string }> {
    return new Observable(observer => {
      // Simulate API call delay
      setTimeout(() => {
        // Validate input
        if (!credentials.name || !credentials.email || !credentials.password) {
          observer.next({ success: false, message: 'All fields are required' });
          observer.complete();
          return;
        }

        if (credentials.password !== credentials.confirmPassword) {
          observer.next({ success: false, message: 'Passwords do not match' });
          observer.complete();
          return;
        }

        if (credentials.password.length < 6) {
          observer.next({ success: false, message: 'Password must be at least 6 characters' });
          observer.complete();
          return;
        }

        // Check if user already exists
        const existingUsers = this.getStoredUsers();
        const userExists = existingUsers.find(user => user.email === credentials.email);
        
        if (userExists) {
          observer.next({ success: false, message: 'User with this email already exists' });
          observer.complete();
          return;
        }

        // Create new user
        const newUser: User = {
          id: this.generateId(),
          name: credentials.name,
          email: credentials.email,
          preferences: {
            favoriteDestinations: [],
            preferredCategories: []
          }
        };

        // Save user
        existingUsers.push(newUser);
        localStorage.setItem('wandrly_users', JSON.stringify(existingUsers));
        localStorage.setItem('wandrly_user', JSON.stringify(newUser));
        
        this.currentUserSubject.next(newUser);
        observer.next({ success: true, message: 'Registration successful!' });
        observer.complete();
      }, 1000);
    });
  }

  login(credentials: LoginCredentials): Observable<{ success: boolean; message: string }> {
    return new Observable(observer => {
      // Simulate API call delay
      setTimeout(() => {
        const users = this.getStoredUsers();
        const user = users.find(u => u.email === credentials.email);
        
        if (!user) {
          observer.next({ success: false, message: 'User not found' });
          observer.complete();
          return;
        }

        // In a real app, you'd verify the password hash
        // For demo purposes, we'll just check if password is not empty
        if (!credentials.password) {
          observer.next({ success: false, message: 'Invalid password' });
          observer.complete();
          return;
        }

        // Save current session
        localStorage.setItem('wandrly_user', JSON.stringify(user));
        this.currentUserSubject.next(user);
        
        observer.next({ success: true, message: 'Login successful!' });
        observer.complete();
      }, 1000);
    });
  }

  logout(): void {
    localStorage.removeItem('wandrly_user');
    this.currentUserSubject.next(null);
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  isLoggedIn(): boolean {
    return this.currentUserSubject.value !== null;
  }

  updateUserPreferences(preferences: Partial<User['preferences']>): void {
    const currentUser = this.getCurrentUser();
    if (currentUser) {
      const updatedUser: User = {
        ...currentUser,
        preferences: { 
          favoriteDestinations: preferences.favoriteDestinations || currentUser.preferences.favoriteDestinations,
          preferredCategories: preferences.preferredCategories || currentUser.preferences.preferredCategories
        }
      };
      
      // Update stored user
      localStorage.setItem('wandrly_user', JSON.stringify(updatedUser));
      
      // Update in users list
      const users = this.getStoredUsers();
      const userIndex = users.findIndex(u => u.id === currentUser.id);
      if (userIndex !== -1) {
        users[userIndex] = updatedUser;
        localStorage.setItem('wandrly_users', JSON.stringify(users));
      }
      
      this.currentUserSubject.next(updatedUser);
    }
  }

  private getStoredUsers(): User[] {
    const stored = localStorage.getItem('wandrly_users');
    return stored ? JSON.parse(stored) : [];
  }

  private generateId(): string {
    return 'user_' + Math.random().toString(36).substr(2, 9);
  }
}
