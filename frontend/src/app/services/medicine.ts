
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Medicine {
  id: number;
  name: string;
  dosage: string;
  start_date: string;
  end_date: string | null;
  is_active: boolean;
}

export interface MedicineCreate {
  name: string;
  dosage: string;
  start_date: string;
  end_date: string | null;
}

export interface MedicineReminder {
  id: number;
  medicine_id: number;
  reminder_time: string;
  is_enabled: boolean;
}

export interface MedicineReminderCreate {
  reminder_time: string;
  is_enabled?: boolean;
}

export interface MedicineReminderUpdate {
  reminder_time?: string;
  is_enabled?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class MedicineService {
  private apiUrl = 'http://127.0.0.1:8000/medicines';
  private reminderApiUrl = 'http://127.0.0.1:8000/reminders';

  constructor(private http: HttpClient) {}

  // Medicine methods

  getMedicines(): Observable<Medicine[]> {
    return this.http.get<Medicine[]>(this.apiUrl);
  }

  addMedicine(medicine: MedicineCreate): Observable<Medicine> {
    return this.http.post<Medicine>(this.apiUrl, medicine);
  }

  updateMedicine(
    id: number,
    medicine: MedicineCreate
  ): Observable<Medicine> {
    return this.http.put<Medicine>(
      `${this.apiUrl}/${id}`,
      medicine
    );
  }

  deleteMedicine(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // Reminder methods

  getReminders(medicineId: number): Observable<MedicineReminder[]> {
    return this.http.get<MedicineReminder[]>(
      `${this.apiUrl}/${medicineId}/reminders`
    );
  }

  addReminder(
    medicineId: number,
    reminder: MedicineReminderCreate
  ): Observable<MedicineReminder> {
    return this.http.post<MedicineReminder>(
      `${this.apiUrl}/${medicineId}/reminders`,
      reminder
    );
  }

  updateReminder(
    reminderId: number,
    changes: MedicineReminderUpdate
  ): Observable<MedicineReminder> {
    return this.http.patch<MedicineReminder>(
      `${this.reminderApiUrl}/${reminderId}`,
      changes
    );
  }

  deleteReminder(reminderId: number): Observable<void> {
    return this.http.delete<void>(
      `${this.reminderApiUrl}/${reminderId}`
    );
  }
}
