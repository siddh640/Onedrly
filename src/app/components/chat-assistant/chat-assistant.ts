import { Component, Input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AssistantService, ChatResponse, ChatSuggestion } from '../../services/assistant.service';

interface ChatMessage {
  role: 'user' | 'assistant';
  text: string;
  suggestions?: ChatSuggestion[];
  tips?: string[];
}

@Component({
  selector: 'app-chat-assistant',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chat-assistant.html',
  styleUrl: './chat-assistant.css'
})
export class ChatAssistant {
  @Input() destination: string | null = null;

  protected isOpen = signal(false);
  protected loading = signal(false);
  protected question = '';
  protected messages = signal<ChatMessage[]>([
    {
      role: 'assistant',
      text: 'Hey there! I am your Onedrly AI concierge. Ask me about restaurants, hotels or plan a custom itinerary.'
    }
  ]);

  constructor(private assistantService: AssistantService) {}

  toggle(): void {
    this.isOpen.update(value => !value);
  }

  sendMessage(): void {
    const message = this.question.trim();
    if (!message || this.loading()) {
      return;
    }

    this.messages.update(list => [...list, { role: 'user', text: message }]);
    this.question = '';
    this.loading.set(true);

    this.assistantService.askQuestion({
      message,
      destination: this.destination || undefined,
      context: {
        destination: this.destination
      }
    }).subscribe({
      next: (response) => {
        const data = response.data;
        if (!response.success || !data) {
          this.pushAssistantMessage('I could not fetch live data right now. Please try another question.');
          return;
        }
        this.pushAssistantMessage(data.answer, data);
      },
      error: () => {
        this.pushAssistantMessage('Something went wrong fetching live data. Please try again.');
      }
    });
  }

  useQuickPrompt(text: string): void {
    this.question = text;
    this.sendMessage();
  }

  selectSuggestion(suggestion: ChatSuggestion): void {
    const text = `Tell me more about ${suggestion.name}`;
    this.question = text;
    this.sendMessage();
  }

  private pushAssistantMessage(text: string, data?: ChatResponse): void {
    this.loading.set(false);
    this.messages.update(list => [
      ...list,
      {
        role: 'assistant',
        text,
        suggestions: data?.suggestions,
        tips: data?.tips
      }
    ]);
  }
}


