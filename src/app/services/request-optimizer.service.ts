/**
 * Request Optimizer Service
 * 
 * Frontend optimization for API calls:
 * 1. Debouncing - Prevent duplicate rapid requests
 * 2. Caching - Store recent results
 * 3. Request deduplication - Merge simultaneous identical requests
 * 4. Loading state management
 */

import { Injectable } from '@angular/core';
import { Observable, Subject, timer } from 'rxjs';
import { debounceTime, distinctUntilChanged, shareReplay, switchMap } from 'rxjs/operators';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

interface PendingRequest {
  subject: Subject<any>;
  timestamp: number;
}

@Injectable({
  providedIn: 'root'
})
export class RequestOptimizerService {
  private cache = new Map<string, CacheEntry<any>>();
  private pendingRequests = new Map<string, PendingRequest>();
  
  // Default configuration
  private readonly DEFAULT_DEBOUNCE_TIME = 500; // 500ms
  private readonly DEFAULT_CACHE_TTL = 5 * 60 * 1000; // 5 minutes
  private readonly MAX_CACHE_SIZE = 100;

  constructor() {
    // Clean up expired cache entries every minute
    setInterval(() => this.cleanExpiredCache(), 60000);
  }

  /**
   * Debounce an observable (useful for search inputs)
   */
  debounce<T>(observable: Observable<T>, time = this.DEFAULT_DEBOUNCE_TIME): Observable<T> {
    return observable.pipe(
      debounceTime(time),
      distinctUntilChanged()
    );
  }

  /**
   * Make an optimized request with caching and deduplication
   * 
   * @param cacheKey - Unique key for caching this request
   * @param requestFn - Function that returns an Observable
   * @param cacheTTL - Cache time-to-live in milliseconds
   * @returns Observable with the request result
   */
  optimizedRequest<T>(
    cacheKey: string,
    requestFn: () => Observable<T>,
    cacheTTL: number = this.DEFAULT_CACHE_TTL
  ): Observable<T> {
    // Check cache first
    const cached = this.getFromCache<T>(cacheKey);
    if (cached) {
      console.log(`✅ Cache HIT for: ${cacheKey}`);
      return new Observable(observer => {
        observer.next(cached);
        observer.complete();
      });
    }

    // Check if there's already a pending request for this key
    const pending = this.pendingRequests.get(cacheKey);
    if (pending) {
      console.log(`🔄 Reusing pending request for: ${cacheKey}`);
      return pending.subject.asObservable();
    }

    // Create new request
    console.log(`🌐 Making new request for: ${cacheKey}`);
    const subject = new Subject<T>();
    
    this.pendingRequests.set(cacheKey, {
      subject,
      timestamp: Date.now()
    });

    // Execute the request
    requestFn().subscribe({
      next: (data) => {
        // Store in cache
        this.setInCache(cacheKey, data, cacheTTL);
        
        // Notify all subscribers
        subject.next(data);
        subject.complete();
        
        // Remove from pending
        this.pendingRequests.delete(cacheKey);
      },
      error: (error) => {
        // Notify error
        subject.error(error);
        
        // Remove from pending
        this.pendingRequests.delete(cacheKey);
      }
    });

    return subject.asObservable();
  }

  /**
   * Get data from cache
   */
  private getFromCache<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }

    // Check if expired
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  /**
   * Store data in cache
   */
  private setInCache<T>(key: string, data: T, ttl: number): void {
    // Enforce max cache size
    if (this.cache.size >= this.MAX_CACHE_SIZE) {
      // Remove oldest entry
      const oldestKey = this.cache.keys().next().value as string | undefined;
      if (oldestKey !== undefined) {
        this.cache.delete(oldestKey);
      }
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      expiresAt: Date.now() + ttl
    });
  }

  /**
   * Clean up expired cache entries
   */
  private cleanExpiredCache(): void {
    const now = Date.now();
    let removedCount = 0;

    this.cache.forEach((entry, key) => {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
        removedCount++;
      }
    });

    if (removedCount > 0) {
      console.log(`🧹 Cleaned ${removedCount} expired cache entries`);
    }
  }

  /**
   * Clear all cache
   */
  clearCache(): void {
    this.cache.clear();
    console.log('🗑️ Cache cleared');
  }

  /**
   * Clear specific cache entry
   */
  clearCacheEntry(key: string): void {
    this.cache.delete(key);
    console.log(`🗑️ Cleared cache for: ${key}`);
  }

  /**
   * Get cache statistics
   */
  getCacheStats() {
    return {
      size: this.cache.size,
      maxSize: this.MAX_CACHE_SIZE,
      entries: Array.from(this.cache.keys())
    };
  }

  /**
   * Cancel pending request
   */
  cancelPendingRequest(key: string): void {
    const pending = this.pendingRequests.get(key);
    if (pending) {
      pending.subject.error(new Error('Request cancelled'));
      this.pendingRequests.delete(key);
      console.log(`❌ Cancelled pending request: ${key}`);
    }
  }

  /**
   * Create a debounced search function
   * Useful for search bars with live results
   */
  createDebouncedSearch<T>(
    searchFn: (query: string) => Observable<T>,
    debounceMs = 500
  ): (query: string) => Observable<T> {
    const searchSubject = new Subject<string>();
    
    const debouncedSearch = searchSubject.pipe(
      debounceTime(debounceMs),
      distinctUntilChanged(),
      switchMap(query => searchFn(query)),
      shareReplay(1)
    );

    // Subscribe to keep the pipe active
    debouncedSearch.subscribe();

    return (query: string) => {
      searchSubject.next(query);
      return debouncedSearch;
    };
  }
}

