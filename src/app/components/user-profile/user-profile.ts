import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService, User } from '../../services/auth.service';
import { SearchHistoryEntry, UserDataService } from '../../services/user-data.service';
import { BookingSummary, UserStats } from '../../models/user.model';
import { Favorite } from '../../models/favorite.model';
import { FavoritesService } from '../../services/favorites.service';

@Component({
  selector: 'app-user-profile',
  imports: [CommonModule],
  templateUrl: './user-profile.html',
  styleUrl: './user-profile.css'
})
export class UserProfile implements OnInit {
  user: User | null = null;
  stats: UserStats | null = null;
  recentBookings: BookingSummary[] = [];
  savedFavorites: Favorite[] = [];
  recentSearches: SearchHistoryEntry[] = [];

  constructor(
    private authService: AuthService,
    private userDataService: UserDataService,
    private favoritesService: FavoritesService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.user = user;
    });
    this.loadStats();
    this.loadFavorites();
    this.loadRecentSearches();
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }

  goBack(): void {
    this.router.navigate(['/']);
  }

  private loadStats(): void {
    this.userDataService.getUserStats().subscribe(({ stats, recentBookings }) => {
      this.stats = stats;
      this.recentBookings = recentBookings;
    });
  }

  private loadFavorites(): void {
    this.favoritesService.favorites$.subscribe(favorites => {
      this.savedFavorites = favorites.slice(0, 5);
    });
    this.favoritesService.loadFavorites().subscribe();
  }

  private loadRecentSearches(): void {
    this.userDataService.getRecentSearches().subscribe(searches => {
      this.recentSearches = searches;
    });
  }
}
