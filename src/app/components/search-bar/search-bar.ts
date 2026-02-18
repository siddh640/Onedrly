import { Component, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-search-bar',
  imports: [FormsModule],
  templateUrl: './search-bar.html',
  styleUrl: './search-bar.css'
})
export class SearchBar {
  destination = '';
  origin = '';
  departureDate = '';
  returnDate = '';
  guests = '1';
  searchType = signal<'destination' | 'flights' | 'hotels' | 'trains' | 'buses'>('destination');
  onSearch = output<string>();

  setSearchType(type: 'destination' | 'flights' | 'hotels' | 'trains' | 'buses'): void {
    this.searchType.set(type);
  }

  search(): void {
    if (this.searchType() === 'destination' && this.destination.trim()) {
      this.onSearch.emit(this.destination.trim());
    } else if (this.searchType() !== 'destination' && this.destination.trim()) {
      // For travel bookings, emit destination for now
      this.onSearch.emit(this.destination.trim());
    }
  }

  handleKeyPress(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      this.search();
    }
  }
}
