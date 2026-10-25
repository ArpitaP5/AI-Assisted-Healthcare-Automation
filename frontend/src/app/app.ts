
import {
  Component,
  OnInit,
  ChangeDetectorRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import {
  Medicine,
  MedicineCreate,
  MedicineReminder,
  MedicineService
} from './services/medicine';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  appName = 'Medicine Reminder';
  subtitle = 'Your personal medicine schedule tracker';

  medicines: Medicine[] = [];
  loading = true;
  errorMessage = '';
  successMessage = '';
  saving = false;

  editingId: number | null = null;

  searchTerm = '';
  statusFilter: 'all' | 'active' | 'inactive' = 'all';

  remindersByMedicine: Record<number, MedicineReminder[]> = {};
  reminderTimes: Record<number, string> = {};
  reminderLoading: Record<number, boolean> = {};
  reminderSaving: Record<number, boolean> = {};

  notificationPermission: NotificationPermission =
    typeof Notification !== 'undefined'
      ? Notification.permission
      : 'default';

  private reminderCheckInterval: ReturnType<typeof setInterval> | null =
    null;

  private notifiedReminders = new Set<string>();

  newMedicine: MedicineCreate = this.createEmptyMedicine();

  constructor(
    private medicineService: MedicineService,
    private cdr: ChangeDetectorRef
  ) {}

  get activeMedicineCount(): number {
    return this.medicines.filter(
      medicine => medicine.is_active
    ).length;
  }

  get filteredMedicines(): Medicine[] {
    const search = this.searchTerm.trim().toLowerCase();

    return this.medicines.filter(medicine => {
      const matchesName = medicine.name
        .toLowerCase()
        .includes(search);

      const matchesStatus =
        this.statusFilter === 'all' ||
        (this.statusFilter === 'active' && medicine.is_active) ||
        (this.statusFilter === 'inactive' && !medicine.is_active);

      return matchesName && matchesStatus;
    });
  }

  ngOnInit(): void {
    this.loadMedicines();
    this.startReminderChecker();
  }

  private createEmptyMedicine(): MedicineCreate {
    return {
      name: '',
      dosage: '',
      start_date: new Date().toISOString().slice(0, 10),
      end_date: null
    };
  }

  requestNotificationPermission(): void {
    if (!('Notification' in window)) {
      this.errorMessage =
        'Your browser does not support notifications.';
      return;
    }

    Notification.requestPermission().then(permission => {
      this.notificationPermission = permission;

      if (permission === 'granted') {
        this.successMessage =
          'Browser notifications enabled successfully!';
        this.errorMessage = '';
      } else {
        this.errorMessage =
          'Notifications were not enabled. Check your browser site settings.';
      }

      this.cdr.detectChanges();
    });
  }

  private startReminderChecker(): void {
    if (this.reminderCheckInterval !== null) {
      clearInterval(this.reminderCheckInterval);
    }

    // Check once immediately, then every 15 seconds.
    this.checkDueReminders();

    this.reminderCheckInterval = setInterval(() => {
      this.checkDueReminders();
    }, 15000);
  }

  private checkDueReminders(): void {
    if (
      typeof Notification === 'undefined' ||
      Notification.permission !== 'granted'
    ) {
      return;
    }

    const now = new Date();
    const currentTime = [
      String(now.getHours()).padStart(2, '0'),
      String(now.getMinutes()).padStart(2, '0')
    ].join(':');

    const today = [
      now.getFullYear(),
      String(now.getMonth() + 1).padStart(2, '0'),
      String(now.getDate()).padStart(2, '0')
    ].join('-');

    for (const medicine of this.medicines) {
      if (!medicine.is_active) {
        continue;
      }

      if (medicine.start_date > today) {
        continue;
      }

      if (medicine.end_date && medicine.end_date < today) {
        continue;
      }

      const reminders =
        this.remindersByMedicine[medicine.id] ?? [];

      for (const reminder of reminders) {
        if (!reminder.is_enabled) {
          continue;
        }

        if (reminder.reminder_time.slice(0, 5) !== currentTime) {
          continue;
        }

        const notificationKey =
          `${today}-${reminder.id}-${currentTime}`;

        if (this.notifiedReminders.has(notificationKey)) {
          continue;
        }

        this.notifiedReminders.add(notificationKey);

        try {
          new Notification('Medicine Reminder', {
            body:
              `Time for ${medicine.name} (${medicine.dosage}). ` +
              'Follow your prescribed instructions.'
          });
        } catch (error) {
          console.error('Unable to display notification:', error);
        }
      }
    }
  }

  loadMedicines(): void {
    this.loading = true;
    this.errorMessage = '';

    this.medicineService.getMedicines().subscribe({
      next: data => {
        this.medicines = data;
        this.loading = false;

        for (const medicine of data) {
          this.loadReminders(medicine.id);
        }

        this.cdr.detectChanges();
      },
      error: error => {
        console.error('Failed to load medicines:', error);
        this.errorMessage =
          'Unable to load medicines. Please check the backend.';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  private loadReminders(medicineId: number): void {
    this.reminderLoading[medicineId] = true;

    this.medicineService.getReminders(medicineId).subscribe({
      next: reminders => {
        this.remindersByMedicine[medicineId] = reminders;
        this.reminderLoading[medicineId] = false;
        this.cdr.detectChanges();
      },
      error: error => {
        console.error(
          `Failed to load reminders for medicine ${medicineId}:`,
          error
        );
        this.remindersByMedicine[medicineId] = [];
        this.reminderLoading[medicineId] = false;
        this.cdr.detectChanges();
      }
    });
  }

  addReminder(medicineId: number): void {
    this.errorMessage = '';
    this.successMessage = '';

    const time = this.reminderTimes[medicineId];

    if (!time) {
      this.errorMessage = 'Please select a reminder time.';
      return;
    }

    const reminders = this.remindersByMedicine[medicineId] ?? [];

    if (reminders.some(reminder =>
      reminder.reminder_time.slice(0, 5) === time
    )) {
      this.errorMessage = 'This reminder time already exists.';
      return;
    }

    this.reminderSaving[medicineId] = true;

    this.medicineService.addReminder(medicineId, {
      reminder_time: `${time}:00`,
      is_enabled: true
    }).subscribe({
      next: reminder => {
        this.remindersByMedicine[medicineId] = [
          ...reminders,
          reminder
        ].sort((a, b) =>
          a.reminder_time.localeCompare(b.reminder_time)
        );

        this.reminderTimes[medicineId] = '';
        this.reminderSaving[medicineId] = false;
        this.successMessage = 'Reminder time added successfully!';
        this.cdr.detectChanges();
      },
      error: error => {
        console.error('Failed to add reminder:', error);
        this.errorMessage =
          error.error?.detail ||
          'Unable to add reminder. Please try again.';
        this.reminderSaving[medicineId] = false;
        this.cdr.detectChanges();
      }
    });
  }

  toggleReminder(reminder: MedicineReminder): void {
    this.errorMessage = '';
    this.successMessage = '';

    const newEnabledState = !reminder.is_enabled;

    this.medicineService.updateReminder(reminder.id, {
      is_enabled: newEnabledState
    }).subscribe({
      next: updatedReminder => {
        this.remindersByMedicine[reminder.medicine_id] =
          (this.remindersByMedicine[reminder.medicine_id] ?? [])
            .map(item =>
              item.id === updatedReminder.id
                ? updatedReminder
                : item
            );

        this.successMessage = newEnabledState
          ? 'Reminder enabled.'
          : 'Reminder disabled.';

        this.cdr.detectChanges();
      },
      error: error => {
        console.error('Failed to update reminder:', error);
        this.errorMessage =
          error.error?.detail ||
          'Unable to update reminder. Please try again.';
        this.cdr.detectChanges();
      }
    });
  }

  deleteReminder(reminder: MedicineReminder): void {
    this.errorMessage = '';
    this.successMessage = '';

    if (!confirm('Delete this reminder time?')) {
      return;
    }

    this.medicineService.deleteReminder(reminder.id).subscribe({
      next: () => {
        this.remindersByMedicine[reminder.medicine_id] =
          (this.remindersByMedicine[reminder.medicine_id] ?? [])
            .filter(item => item.id !== reminder.id);

        this.successMessage = 'Reminder deleted successfully!';
        this.cdr.detectChanges();
      },
      error: error => {
        console.error('Failed to delete reminder:', error);
        this.errorMessage =
          error.error?.detail ||
          'Unable to delete reminder. Please try again.';
        this.cdr.detectChanges();
      }
    });
  }

  saveMedicine(): void {
    this.errorMessage = '';
    this.successMessage = '';

    if (
      !this.newMedicine.name.trim() ||
      !this.newMedicine.dosage.trim() ||
      !this.newMedicine.start_date
    ) {
      this.errorMessage =
        'Please enter the medicine name, dosage and start date.';
      return;
    }

    if (
      this.newMedicine.end_date &&
      this.newMedicine.end_date < this.newMedicine.start_date
    ) {
      this.errorMessage =
        'End date cannot be earlier than start date.';
      return;
    }

    this.saving = true;

    const payload: MedicineCreate = {
      name: this.newMedicine.name.trim(),
      dosage: this.newMedicine.dosage.trim(),
      start_date: this.newMedicine.start_date,
      end_date: this.newMedicine.end_date || null
    };

    if (this.editingId !== null) {
      this.updateExistingMedicine(this.editingId, payload);
    } else {
      this.addNewMedicine(payload);
    }
  }

  private addNewMedicine(payload: MedicineCreate): void {
    this.medicineService.addMedicine(payload).subscribe({
      next: createdMedicine => {
        this.medicines = [...this.medicines, createdMedicine];
        this.newMedicine = this.createEmptyMedicine();
        this.loadReminders(createdMedicine.id);
        this.successMessage = 'Medicine added successfully!';
        this.saving = false;
        this.cdr.detectChanges();
      },
      error: error => {
        console.error('Failed to add medicine:', error);
        this.errorMessage =
          error.error?.detail ||
          'Unable to add medicine. Please try again.';
        this.saving = false;
        this.cdr.detectChanges();
      }
    });
  }

  editMedicine(medicine: Medicine): void {
    this.errorMessage = '';
    this.successMessage = '';
    this.editingId = medicine.id;

    this.newMedicine = {
      name: medicine.name,
      dosage: medicine.dosage,
      start_date: medicine.start_date,
      end_date: medicine.end_date
    };

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  private updateExistingMedicine(
    id: number,
    payload: MedicineCreate
  ): void {
    this.medicineService.updateMedicine(id, payload).subscribe({
      next: updatedMedicine => {
        this.medicines = this.medicines.map(medicine =>
          medicine.id === id ? updatedMedicine : medicine
        );

        this.cancelEdit();
        this.successMessage = 'Medicine updated successfully!';
        this.saving = false;
        this.cdr.detectChanges();
      },
      error: error => {
        console.error('Failed to update medicine:', error);
        this.errorMessage =
          error.error?.detail ||
          'Unable to update medicine. Please try again.';
        this.saving = false;
        this.cdr.detectChanges();
      }
    });
  }

  cancelEdit(): void {
    this.editingId = null;
    this.newMedicine = this.createEmptyMedicine();
    this.errorMessage = '';
    this.saving = false;
  }

  deleteMedicine(id: number): void {
    this.errorMessage = '';
    this.successMessage = '';

    if (!confirm('Are you sure you want to delete this medicine?')) {
      return;
    }

    this.medicineService.deleteMedicine(id).subscribe({
      next: () => {
        this.medicines = this.medicines.filter(
          medicine => medicine.id !== id
        );

        delete this.remindersByMedicine[id];
        delete this.reminderTimes[id];

        if (this.editingId === id) {
          this.cancelEdit();
        }

        this.successMessage = 'Medicine deleted successfully!';
        this.cdr.detectChanges();
      },
      error: error => {
        console.error('Failed to delete medicine:', error);
        this.errorMessage =
          error.error?.detail ||
          'Unable to delete medicine. Please try again.';
        this.cdr.detectChanges();
      }
    });
  }
}
