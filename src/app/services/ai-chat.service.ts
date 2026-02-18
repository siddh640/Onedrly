import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, catchError, map, of, tap, throwError } from 'rxjs';
import { environment } from '../../environments/environment';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  metadata?: {
    category?: string;
    suggestions?: string[];
    source?: string;
    confidence?: number;
    destination?: string;
    reason?: string;
  };
}

export interface TravelQuery {
  message: string;
  context?: {
    destination?: string;
    dates?: { start: string; end: string };
    budget?: string;
    travelers?: number;
    interests?: string[];
  };
}

export interface AIResponse {
  message: string;
  suggestions?: string[];
  metadata?: {
    model?: string;
    tokens?: any;
    category?: string;
    conversationId?: string;
    source?: string;
    destination?: string;
    confidence?: number;
    knowledgeContextUsed?: boolean;
    reason?: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class AiChatService {
  private readonly apiUrl = `${environment.backendUrl.replace(/\/api$/, '')}/onedrly-ai`;
  private chatHistory = signal<ChatMessage[]>([]);
  private isLoading = signal<boolean>(false);
  private conversationId = signal<string>(this.generateId());

  constructor(private http: HttpClient) {
    this.initializeChat();
  }

  private initializeChat(): void {
    const welcomeMessage: ChatMessage = {
      id: this.generateId(),
      role: 'assistant',
      content: `Hello! 👋 I'm Onedrly AI — your personal travel concierge. Ask me anything about destinations, itineraries, food, safety, budgets, or packing and I'll craft the perfect plan.`,
      timestamp: new Date()
    };
    this.chatHistory.update(history => [...history, welcomeMessage]);
  }

  sendMessage(query: TravelQuery): Observable<AIResponse> {
    this.isLoading.set(true);

    const userMessage: ChatMessage = {
      id: this.generateId(),
      role: 'user',
      content: query.message,
      timestamp: new Date()
    };
    this.chatHistory.update(history => [...history, userMessage]);

    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });

    const payload = {
      message: query.message,
      context: query.context,
      conversationId: this.conversationId(),
      history: this.chatHistory().map(({ role, content }) => ({ role, content }))
    };

    return this.http.post<AIResponse>(`${this.apiUrl}/chat`, payload, { headers }).pipe(
      tap(response => {
        const aiMessage: ChatMessage = {
          id: this.generateId(),
          role: 'assistant',
          content: response.message,
          timestamp: new Date(),
          metadata: {
            suggestions: response.suggestions,
            category: response.metadata?.category,
            source: response.metadata?.source,
            confidence: response.metadata?.confidence,
            destination: response.metadata?.destination,
            reason: response.metadata?.reason
          }
        };
        this.chatHistory.update(history => [...history, aiMessage]);
        this.isLoading.set(false);
      }),
      catchError(error => {
        this.isLoading.set(false);
        const errorMessage: ChatMessage = {
          id: this.generateId(),
          role: 'assistant',
          content: error?.error?.message ||
            'I’m facing a hiccup fetching live data. Try again in a moment or ask for curated suggestions!',
          timestamp: new Date(),
          metadata: {
            source: 'fallback',
            reason: error?.error?.metadata?.reason || 'network-error',
            suggestions: [
              'Plan a quick itinerary for me',
              'Share budget tips for this destination',
              'Tell me about local food to try'
            ]
          }
        };
        this.chatHistory.update(history => [...history, errorMessage]);
        return throwError(() => error);
      })
    );
  }

  getTravelRecommendations(preferences: {
    destination?: string;
    budget?: string;
    duration?: number;
    interests?: string[];
  }): Observable<any> {
    return this.http.post(`${this.apiUrl}/recommendations`, preferences);
  }

  generateItinerary(params: {
    destination: string;
    days: number;
    interests?: string[];
    budget?: string;
  }): Observable<any> {
    return this.http.post(`${this.apiUrl}/itinerary`, params);
  }

  getDestinationInfo(destination: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/destination/${encodeURIComponent(destination)}`);
  }

  getTravelTips(destination: string, category?: string): Observable<any> {
    const params = category ? `?category=${category}` : '';
    return this.http.get(`${this.apiUrl}/tips/${encodeURIComponent(destination)}${params}`);
  }

  getPackingList(params: {
    destination: string;
    duration: number;
    season?: string;
    activities?: string[];
  }): Observable<any> {
    return this.http.post(`${this.apiUrl}/packing-list`, params);
  }

  estimateBudget(params: {
    destination: string;
    duration: number;
    travelers: number;
    accommodation?: string;
    activities?: string[];
  }): Observable<any> {
    return this.http.post(`${this.apiUrl}/budget-estimate`, params);
  }

  clearChat(): void {
    this.chatHistory.set([]);
    this.conversationId.set(this.generateId());
    this.initializeChat();
  }

  getChatHistorySignal() {
    return this.chatHistory;
  }

  getLoadingState() {
    return this.isLoading;
  }

  rateResponse(messageId: string, rating: 'positive' | 'negative', feedback?: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/feedback`, {
      messageId,
      rating,
      feedback,
      conversationId: this.conversationId()
    });
  }

  getKnowledgeDestinations(): Observable<string[]> {
    return this.http.get<{ destinations: string[] }>(`${this.apiUrl}/knowledge/destinations`).pipe(
      map(res => res.destinations || []),
      catchError(() => of([]))
    );
  }

  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
  }
}


