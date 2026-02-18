import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AssistantService, EmergencyResponse } from '../../services/assistant.service';

@Component({
  selector: 'app-emergency-widget',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './emergency-widget.html',
  styleUrl: './emergency-widget.css'
})
export class EmergencyWidget implements OnChanges {
  @Input() destination: string | null = null;

  protected loading = false;
  protected data: EmergencyResponse | null = null;
  protected errorMessage = '';

  constructor(private assistantService: AssistantService) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['destination'] && this.destination) {
      this.fetchData();
    }
  }

  private fetchData(): void {
    this.loading = true;
    this.errorMessage = '';

    this.assistantService.getEmergencyInfo(this.destination as string).subscribe({
      next: (response) => {
        this.loading = false;
        if (!response.success || !response.data) {
          this.errorMessage = response.message || 'Unable to load emergency info.';
          return;
        }
        this.data = response.data;
      },
      error: () => {
        this.loading = false;
        this.errorMessage = 'Unable to load emergency info.';
      }
    });
  }
}


