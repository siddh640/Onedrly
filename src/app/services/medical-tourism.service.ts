import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Place } from './places';

export interface MedicalFacility extends Place {
  facilityType?: 'hospital' | 'clinic' | 'pharmacy' | 'dentist' | 'other';
  specialties?: string[];
  emergencyServices?: boolean;
  appointmentAvailable?: boolean;
}

export interface MedicalSearchResponse {
  success: boolean;
  data?: {
    destination: string;
    total: number;
    facilities: MedicalFacility[];
    categorized: {
      hospitals: MedicalFacility[];
      clinics: MedicalFacility[];
      pharmacies: MedicalFacility[];
      dentists: MedicalFacility[];
    };
    source: string;
  };
  message?: string;
}

export interface AppointmentBookingRequest {
  facilityId?: string;
  facilityName: string;
  facilityType: string;
  patientName: string;
  patientEmail: string;
  patientPhone: string;
  appointmentDate: string;
  appointmentTime: string;
  reason?: string;
  notes?: string;
}

export interface AppointmentBookingResponse {
  success: boolean;
  message?: string;
  data?: {
    appointment: {
      appointmentId: string;
      facilityName: string;
      appointmentDate: string;
      appointmentTime: string;
      status: string;
    };
    confirmation: {
      reference: string;
      message: string;
      nextSteps: string[];
    };
  };
}

@Injectable({
  providedIn: 'root'
})
export class MedicalTourismService {
  private readonly MEDICAL_API = `${environment.backendUrl}/medical`;

  constructor(private http: HttpClient) {}

  /**
   * Search for medical facilities in a destination
   */
  searchMedicalFacilities(destination: string, type?: string): Observable<MedicalSearchResponse> {
    const params: any = {};
    if (type && type !== 'all') {
      params.type = type;
    }

    return this.http.get<MedicalSearchResponse>(
      `${this.MEDICAL_API}/search/${encodeURIComponent(destination)}`,
      { params }
    );
  }

  /**
   * Book a medical appointment
   */
  bookAppointment(request: AppointmentBookingRequest): Observable<AppointmentBookingResponse> {
    return this.http.post<AppointmentBookingResponse>(
      `${this.MEDICAL_API}/book-appointment`,
      request
    );
  }

  /**
   * Get user's appointments (requires authentication)
   */
  getAppointments(): Observable<any> {
    return this.http.get<any>(`${this.MEDICAL_API}/appointments`);
  }
}

