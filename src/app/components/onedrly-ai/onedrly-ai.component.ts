import { Component, ViewChild, ElementRef, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AiChatService, ChatMessage, TravelQuery } from '../../services/ai-chat.service';

@Component({
  selector: 'app-onedrly-ai',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './onedrly-ai.component.html',
  styleUrl: './onedrly-ai.component.css'
})
export class OnedrlyAiComponent {
  @ViewChild('chatContainer') private chatContainer!: ElementRef<HTMLDivElement>;
  @ViewChild('messageInput') private messageInput!: ElementRef<HTMLInputElement>;

  protected userMessage = signal('');
  protected chatHistory!: ReturnType<AiChatService['getChatHistorySignal']>;
  protected isLoading!: ReturnType<AiChatService['getLoadingState']>;
  protected showQuickActions = signal(true);
  protected isPanelCollapsed = signal(true);
  protected suggestedQuestions = signal<string[]>([
    'Weather in Shimla right now?',
    'Top hotels in Goa this weekend',
    'Must-try cafés in Manali?'
  ]);

  protected destination = signal('');
  protected travelDates = signal({ start: '', end: '' });
  protected travelers = signal(2);
  protected budget = signal('');
  protected interests = signal<string[]>([]);

  protected quickActions = [
    { label: '🏖️ Beach Destinations', query: 'Suggest relaxing beach destinations with boutique stays' },
    { label: '🏔️ Mountain Adventures', query: 'Plan an offbeat mountain adventure for 5 days' },
    { label: '🍜 Food Trails', query: 'Where should I go for a food-focused getaway?' },
    { label: '🧘 Wellness Escape', query: 'Recommend serene wellness retreats in India' },
    { label: '👨‍👩‍👧 Family Fun', query: 'What are the best family-friendly destinations this season?' }
  ];

  protected availableInterests = [
    'Adventure', 'Culture', 'Food', 'Nature', 'History',
    'Photography', 'Shopping', 'Nightlife', 'Beaches', 'Mountains'
  ];

  constructor(private chatService: AiChatService) {
    this.chatHistory = this.chatService.getChatHistorySignal();
    this.isLoading = this.chatService.getLoadingState();
    this.loadSuggestedQuestions();

    effect(() => {
      if (this.chatHistory().length > 0) {
        setTimeout(() => this.scrollToBottom(), 120);
      }
    });
  }

  updateStartDate(date: string): void {
    this.travelDates.update(dates => ({ ...dates, start: date }));
  }

  updateEndDate(date: string): void {
    this.travelDates.update(dates => ({ ...dates, end: date }));
  }

  sendMessage(): void {
    const message = this.userMessage().trim();
    if (!message || this.isLoading()) return;

    const query: TravelQuery = {
      message,
      context: this.buildContext()
    };

    this.chatService.sendMessage(query).subscribe({
      next: () => {},
      error: () => {}
    });

    this.userMessage.set('');
    this.showQuickActions.set(false);
  }

  sendQuickAction(query: string): void {
    this.userMessage.set(query);
    this.sendMessage();
  }

  useSuggestedQuestion(question: string): void {
    this.userMessage.set(question);
    this.sendMessage();
  }

  private buildContext() {
    const context: Record<string, any> = {};
    if (this.destination()) context['destination'] = this.destination();
    if (this.travelDates().start && this.travelDates().end) context['dates'] = this.travelDates();
    if (this.budget()) context['budget'] = this.budget();
    if (this.travelers() > 0) context['travelers'] = this.travelers();
    if (this.interests().length > 0) context['interests'] = this.interests();
    return Object.keys(context).length ? context : undefined;
  }

  private loadSuggestedQuestions(): void {
    this.chatService.getKnowledgeDestinations().subscribe(destinations => {
      if (!destinations.length) return;
      const curated = destinations.slice(0, 5).map(dest => `Tell me about ${dest}`);
      this.suggestedQuestions.set(curated);
    });
  }

  toggleInterest(interest: string): void {
    const current = this.interests();
    if (current.includes(interest)) {
      this.interests.set(current.filter(i => i !== interest));
    } else {
      this.interests.set([...current, interest]);
    }
  }

  togglePanel(): void {
    this.isPanelCollapsed.set(!this.isPanelCollapsed());
  }

  clearChat(): void {
    if (confirm('Clear the entire chat history?')) {
      this.chatService.clearChat();
      this.showQuickActions.set(true);
      setTimeout(() => this.messageInput?.nativeElement.focus(), 200);
    }
  }

  exportChat(): void {
    const history = this.chatService.getChatHistorySignal()();
    const blob = new Blob([JSON.stringify(history, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `onedrly-ai-${Date.now()}.json`;
    link.click();
    window.URL.revokeObjectURL(url);
  }

  buildItinerary(): void {
    const dest = this.destination();
    if (!dest) {
      alert('Add a destination in the context panel first.');
      return;
    }
    const days = prompt('How many days do you want to plan?', '4');
    if (!days) return;
    this.userMessage.set(`Create a ${days}-day immersive itinerary for ${dest}`);
    this.sendMessage();
  }

  requestPackingList(): void {
    const dest = this.destination();
    if (!dest) {
      alert('Add a destination in the context panel first.');
      return;
    }
    this.userMessage.set(`Create a packing list for ${dest} in ${this.travelDates().start || 'upcoming weeks'}`);
    this.sendMessage();
  }

  requestBudget(): void {
    const dest = this.destination();
    if (!dest) {
      alert('Add a destination in the context panel first.');
      return;
    }
    this.userMessage.set(`Estimate the budget for ${this.travelers()} traveler(s) visiting ${dest}`);
    this.sendMessage();
  }

  onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  formatTime(date: Date): string {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  copyMessage(content: string): void {
    navigator.clipboard.writeText(content);
  }

  rateMessage(message: ChatMessage, rating: 'positive' | 'negative'): void {
    if (!message.id) return;
    this.chatService.rateResponse(message.id, rating).subscribe();
  }

  private scrollToBottom(): void {
    if (this.chatContainer) {
      this.chatContainer.nativeElement.scrollTop = this.chatContainer.nativeElement.scrollHeight;
    }
  }
}


