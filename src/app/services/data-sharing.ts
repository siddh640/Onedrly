import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Place } from './places';

@Injectable({
  providedIn: 'root'
})
export class DataSharingService {
  private attractionsSubject = new BehaviorSubject<Place[]>([]);
  private restaurantsSubject = new BehaviorSubject<Place[]>([]);
  private shoppingSubject = new BehaviorSubject<Place[]>([]);
  private destinationSubject = new BehaviorSubject<string>('');

  attractions$ = this.attractionsSubject.asObservable();
  restaurants$ = this.restaurantsSubject.asObservable();
  shopping$ = this.shoppingSubject.asObservable();
  destination$ = this.destinationSubject.asObservable();

  setAttractions(attractions: Place[]): void {
    this.attractionsSubject.next(attractions);
  }

  setRestaurants(restaurants: Place[]): void {
    this.restaurantsSubject.next(restaurants);
  }

  setShopping(shopping: Place[]): void {
    this.shoppingSubject.next(shopping);
  }

  setDestination(destination: string): void {
    this.destinationSubject.next(destination);
  }

  getAttractions(): Place[] {
    return this.attractionsSubject.value;
  }

  getRestaurants(): Place[] {
    return this.restaurantsSubject.value;
  }

  getShopping(): Place[] {
    return this.shoppingSubject.value;
  }

  getDestination(): string {
    return this.destinationSubject.value;
  }
}
