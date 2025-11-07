import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Place } from '../../../services/places';

@Component({
  selector: 'app-attractions',
  imports: [CommonModule],
  templateUrl: './attractions.html',
  styleUrl: './attractions.css'
})
export class Attractions {
  places = input<Place[]>([]);

  getStatusClass(openNow?: boolean): string {
    return openNow ? 'status-open' : 'status-closed';
  }

  getStatusText(openNow?: boolean): string {
    return openNow ? 'Open Now' : 'Closed';
  }
}
