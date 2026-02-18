import { Component, input, output, signal, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MedicalTourismService, AppointmentBookingRequest } from '../../services/medical-tourism.service';
import { Place } from '../../services/places';

@Component({
  selector: 'app-medical-appointment-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './medical-appointment-modal.html',
  styleUrl: './medical-appointment-modal.css'
})
export class MedicalAppointmentModal implements OnChanges {
  facility = input<Place | null>(null);
  isOpen = input<boolean>(false);
  closeModal = output<void>();
  appointmentBooked = output<any>();

  protected patientName = '';
  protected patientEmail = '';
  protected patientPhone = '';
  protected appointmentDate = '';
  protected appointmentTime = '';
  protected reason = '';
  protected notes = '';

  protected loading = signal(false);
  protected errorMessage = signal('');
  protected success = signal(false);
  protected appointmentDetails = signal<any>(null);

  constructor(private medicalService: MedicalTourismService) {}

  ngOnChanges(): void {
    if (!this.isOpen()) {
      this.resetForm();
    }
  }

  close(): void {
    this.closeModal.emit();
    this.resetForm();
  }

  resetForm(): void {
    this.patientName = '';
    this.patientEmail = '';
    this.patientPhone = '';
    this.appointmentDate = '';
    this.appointmentTime = '';
    this.reason = '';
    this.notes = '';
    this.errorMessage.set('');
    this.success.set(false);
    this.appointmentDetails.set(null);
  }

  getFacilityType(): string {
    const facility = this.facility();
    if (!facility) return 'clinic';
    
    const name = (facility.name || '').toLowerCase();
    const types = (facility.types || []).join(' ').toLowerCase();
    
    if (name.includes('hospital') || types.includes('hospital')) return 'hospital';
    if (name.includes('pharmacy') || types.includes('pharmacy')) return 'pharmacy';
    if (name.includes('dental') || name.includes('dentist') || types.includes('dentist')) return 'dentist';
    if (name.includes('clinic') || types.includes('clinic') || types.includes('doctor')) return 'clinic';
    
    return 'clinic';
  }

  bookAppointment(): void {
    const facility = this.facility();
    if (!facility) {
      this.errorMessage.set('No facility selected');
      return;
    }

    // Validation
    if (!this.patientName || !this.patientEmail || !this.patientPhone || !this.appointmentDate || !this.appointmentTime) {
      this.errorMessage.set('Please fill all required fields');
      return;
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.patientEmail)) {
      this.errorMessage.set('Please enter a valid email address');
      return;
    }

    // Validate phone (basic validation)
    const phoneRegex = /^[\d\s\-\+\(\)]+$/;
    if (!phoneRegex.test(this.patientPhone) || this.patientPhone.replace(/\D/g, '').length < 10) {
      this.errorMessage.set('Please enter a valid phone number');
      return;
    }

    // Validate date (must be in the future)
    const appointmentDateTime = new Date(`${this.appointmentDate}T${this.appointmentTime}`);
    const now = new Date();
    if (appointmentDateTime <= now) {
      this.errorMessage.set('Appointment date and time must be in the future');
      return;
    }

    this.loading.set(true);
    this.errorMessage.set('');

    const request: AppointmentBookingRequest = {
      facilityId: facility.id || facility.placeId,
      facilityName: facility.name,
      facilityType: this.getFacilityType(),
      patientName: this.patientName,
      patientEmail: this.patientEmail,
      patientPhone: this.patientPhone,
      appointmentDate: this.appointmentDate,
      appointmentTime: this.appointmentTime,
      reason: this.reason || 'General consultation',
      notes: this.notes
    };

    this.medicalService.bookAppointment(request).subscribe({
      next: (response) => {
        this.loading.set(false);
        if (response.success && response.data) {
          this.success.set(true);
          this.appointmentDetails.set(response.data);
          this.appointmentBooked.emit(response.data);
        } else {
          this.errorMessage.set(response.message || 'Failed to book appointment');
        }
      },
      error: (error) => {
        this.loading.set(false);
        this.errorMessage.set(error?.error?.message || 'Error booking appointment. Please try again.');
      }
    });
  }

  getMinDate(): string {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  }

  getMaxDate(): string {
    const maxDate = new Date();
    maxDate.setMonth(maxDate.getMonth() + 3); // 3 months in advance
    return maxDate.toISOString().split('T')[0];
  }
}

