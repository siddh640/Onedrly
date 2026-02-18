import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}

export interface ChatRequest {
  message: string;
  destination?: string;
  context?: Record<string, any>;
}

export interface ChatSuggestion {
  name: string;
  rating?: number;
  address?: string;
  description?: string;
  photos?: string[];
  priceLevel?: number;
  tags?: string[];
  link?: string | null;
}

export interface ChatResponse {
  answer: string;
  intent: string;
  destination: string;
  suggestions: ChatSuggestion[];
  tips: string[];
}

export interface TripPlannerRequest {
  destination: string;
  startDate: string;
  endDate: string;
  budget?: number;
  travelers?: number;
  pace?: string;
  preferences?: Record<string, any>;
}

export interface TripPlannerResponse {
  summary: {
    destination: string;
    totalDays: number;
    budget: number;
    budgetPerDay: number;
    recommendedPace: string;
    weatherTip: string;
    mustTryFood: string[];
  };
  itinerary: Array<{
    day: string;
    date: string;
    activities: Array<{
      title: string;
      type: string;
      details: ChatSuggestion;
    }>;
  }>;
  savedTripId?: string | null;
}

export interface EmergencyResponse {
  destination: string;
  hospitals: Array<Record<string, any>>;
  police: Array<Record<string, any>>;
  pharmacies: Array<Record<string, any>>;
  helplines: Array<{ label: string; phone: string }>;
}

@Injectable({
  providedIn: 'root'
})
export class AssistantService {
  private readonly ASSISTANT_API = `${environment.backendUrl}/assistant`;

  constructor(private http: HttpClient) {}

  askQuestion(payload: ChatRequest): Observable<ApiResponse<ChatResponse>> {
    return this.http.post<ApiResponse<ChatResponse>>(
      `${this.ASSISTANT_API}/chat`,
      payload
    );
  }

  planTrip(payload: TripPlannerRequest): Observable<ApiResponse<TripPlannerResponse>> {
    const url = `${this.ASSISTANT_API}/plan-trip`;
    console.log('📤 Sending trip planner request to:', url);
    console.log('📦 Payload:', payload);
    
    return this.http.post<ApiResponse<TripPlannerResponse>>(url, payload).pipe(
      tap({
        next: (response) => {
          console.log('✅ Trip planner response received:', response);
        },
        error: (error) => {
          console.error('❌ Trip planner HTTP error:', error);
          console.error('Error details:', {
            status: error?.status,
            statusText: error?.statusText,
            message: error?.message,
            url: error?.url,
            error: error?.error
          });
        }
      })
    );
  }

  getEmergencyInfo(destination: string): Observable<ApiResponse<EmergencyResponse>> {
    return this.http.get<ApiResponse<EmergencyResponse>>(
      `${this.ASSISTANT_API}/emergency`,
      {
        params: { destination }
      }
    );
  }
}


