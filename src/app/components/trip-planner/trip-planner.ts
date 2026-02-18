import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AssistantService, TripPlannerResponse } from '../../services/assistant.service';

@Component({
  selector: 'app-trip-planner',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './trip-planner.html',
  styleUrl: './trip-planner.css'
})
export class TripPlanner implements OnChanges {
  @Input() defaultDestination: string | null = null;

  protected destination = '';
  protected startDate = '';
  protected endDate = '';
  protected budget = 20000;
  protected travelers = 2;
  protected pace = 'balanced';
  protected includeShopping = true;
  protected includeNightlife = false;

  protected loading = false;
  protected result: TripPlannerResponse | null = null;
  protected errorMessage = '';

  constructor(private assistantService: AssistantService) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['defaultDestination'] && this.defaultDestination && !this.destination) {
      this.destination = this.defaultDestination;
    }
  }

  planTrip(): void {
    // Clear previous error and result
    this.errorMessage = '';
    this.result = null;

    if (!this.destination || !this.startDate || !this.endDate) {
      this.errorMessage = 'Please fill destination and travel dates.';
      return;
    }

    // Validate dates
    const start = new Date(this.startDate);
    const end = new Date(this.endDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      this.errorMessage = 'Please enter valid dates.';
      return;
    }

    if (start < today) {
      this.errorMessage = 'Start date cannot be in the past.';
      return;
    }

    if (end < start) {
      this.errorMessage = 'End date must be after start date.';
      return;
    }

    // Check if trip is too long (more than 30 days)
    const daysDiff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    if (daysDiff > 30) {
      this.errorMessage = 'Trip duration cannot exceed 30 days.';
      return;
    }

    if (daysDiff < 1) {
      this.errorMessage = 'Trip must be at least 1 day long.';
      return;
    }

    this.loading = true;
    this.result = null;
    this.errorMessage = ''; // Clear error immediately

    console.log('🚀 Starting trip planning request:', {
      destination: this.destination,
      startDate: this.startDate,
      endDate: this.endDate,
      budget: this.budget
    });

    this.assistantService.planTrip({
      destination: this.destination,
      startDate: this.startDate,
      endDate: this.endDate,
      budget: this.budget,
      travelers: this.travelers,
      pace: this.pace,
      preferences: {
        shopping: this.includeShopping,
        nightlife: this.includeNightlife
      }
    }).subscribe({
      next: (response) => {
        this.loading = false;
        console.log('Trip planner response:', response);
        if (!response.success || !response.data) {
          this.errorMessage = response.message || 'Unable to build itinerary.';
          console.error('Trip planner error:', response.message);
          return;
        }
        // Validate that we have itinerary data
        if (!response.data.itinerary || response.data.itinerary.length === 0) {
          this.errorMessage = 'No itinerary could be generated. Please try a different destination or date range.';
          console.error('Empty itinerary received');
          return;
        }
        this.result = response.data;
        console.log('Trip planner success:', this.result);
      },
      error: (error) => {
        this.loading = false;
        console.error('Trip planner API error:', error);
        
        // Handle different error types
        if (error?.status === 0 || error?.error?.status === 0) {
          this.errorMessage = 'Cannot connect to server. Please make sure the backend server is running on http://localhost:3000';
        } else if (error?.status === 400) {
          this.errorMessage = error?.error?.message || 'Invalid request. Please check your input and try again.';
        } else if (error?.status === 500) {
          this.errorMessage = error?.error?.message || 'Server error. Please try again in a moment.';
        } else {
          this.errorMessage = error?.error?.message || error?.message || 'Something went wrong while building your trip. Please check your connection and try again.';
        }
      }
    });
  }
}


