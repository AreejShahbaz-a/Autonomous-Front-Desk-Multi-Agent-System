import { Component, OnInit, HostBinding } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faPencil, faTrash, faTimes } from '@fortawesome/free-solid-svg-icons';
import { API_BASE_URL } from '../../config/api.config';

@Component({
  selector: 'app-appointments',
  standalone: true,
  imports: [CommonModule, FormsModule, FontAwesomeModule],
  template: `
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <h2 class="text-2xl font-bold text-slate-900 dark:text-white">Manage Appointments</h2>
      </div>

      <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/50 rounded-xl shadow-sm overflow-hidden">
        <table class="min-w-full divide-y divide-slate-200 dark:divide-slate-800/50">
          <thead class="bg-slate-50 dark:bg-slate-800/50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-slate-600 dark:text-slate-300 uppercase tracking-wider">ID</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-slate-600 dark:text-slate-300 uppercase tracking-wider">Patient</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-slate-600 dark:text-slate-300 uppercase tracking-wider">Doctor</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-slate-600 dark:text-slate-300 uppercase tracking-wider">Date & Time</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-slate-600 dark:text-slate-300 uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody class="bg-white dark:bg-slate-900 divide-y divide-slate-200 dark:divide-slate-800/50">
            <tr *ngFor="let appt of appointments" class="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900 dark:text-white">#{{appt.appointment_id}}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-300"><div class="flex items-center gap-2"><i class="ph ph-user text-slate-400 dark:text-slate-500"></i> {{appt.patient_name}}</div></td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-300"><div class="flex items-center gap-2"><i class="ph ph-stethoscope text-slate-400 dark:text-slate-500"></i> Dr. {{appt.doctor_name}}</div></td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-300">
                <div class="flex flex-col">
                  <span class="font-medium text-slate-900 dark:text-white">{{appt.appointment_date}}</span>
                  <span>{{appt.appointment_time}}</span>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm">
                <select [ngModel]="appt.status" (ngModelChange)="updateStatus(appt, $event)"
                  class="text-sm rounded-md border-slate-300 dark:border-slate-600 py-1 pl-2 pr-6 focus:ring-teal-500 focus:border-teal-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  [ngClass]="{
                    'bg-cyan-50 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300': appt.status === 'scheduled',
                    'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300': appt.status === 'completed',
                    'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300': appt.status === 'cancelled'
                  }">
                  <option value="scheduled">Scheduled</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </td>
            </tr>
            <tr *ngIf="appointments.length === 0">
              <td colspan="5" class="px-6 py-12 text-center text-slate-500 dark:text-slate-400 text-sm">
                No appointments found.
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Reschedule Modal -->
      <div *ngIf="showModal" class="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm">
        <div class="bg-white dark:bg-slate-900 rounded-xl shadow-2xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-800/50">
          <div class="flex justify-between items-center mb-5">
            <h3 class="text-lg font-bold text-slate-900 dark:text-white">Reschedule Appointment</h3>
            <button (click)="closeModal()" class="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
              <i class="ph ph-x text-xl"></i>
            </button>
          </div>
          
          <form (ngSubmit)="saveAppt()" class="space-y-4">
            <div><label class="block text-sm font-semibold text-slate-700 dark:text-slate-200">Date</label>
              <input name="date" type="date" [(ngModel)]="currentAppt.appointment_date" required class="mt-1 block w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-teal-500 focus:border-teal-500 sm:text-sm" />
            </div>
            <div><label class="block text-sm font-semibold text-slate-700 dark:text-slate-200">Time</label>
              <input name="time" type="time" [(ngModel)]="currentAppt.appointment_time" required class="mt-1 block w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-teal-500 focus:border-teal-500 sm:text-sm" />
            </div>

            <div class="pt-4 flex justify-end gap-3">
              <button type="button" (click)="closeModal()" class="bg-white dark:bg-slate-800 py-2 px-4 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-slate-900 focus:ring-teal-500 transition-colors">Cancel</button>
              <button type="submit" class="bg-teal-600 hover:bg-teal-700 dark:bg-teal-700 dark:hover:bg-teal-600 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-slate-900 focus:ring-teal-500 transition-colors">Save Changes</button>
            </div>
          </form>
        </div>
      </div>
    
    </div>
  `
})
export class AppointmentsComponent implements OnInit {
  appointments: any[] = [];
  apiUrl = API_BASE_URL + '/api/admin';
  showModal = false;
  currentAppt: any = {};
  
  faPencil = faPencil;
  faTrash = faTrash;
  faTimes = faTimes;

  @HostBinding('class.dark') isDark = true;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadAppointments();
  }

  loadAppointments() {
    this.http.get<any[]>(`${this.apiUrl}/appointments`).subscribe({
      next: (res) => this.appointments = res,
      error: (err) => console.error("Error loading appointments", err)
    });
  }

  updateStatus(appt: any, newStatus: string) {
    this.http.put(`${this.apiUrl}/appointments/${appt.appointment_id}`, { status: newStatus }).subscribe({
      next: () => this.loadAppointments(),
      error: (err) => console.error("Error updating status", err)
    });
  }

  openModal(appt: any) {
    this.currentAppt = { ...appt };
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
  }

  saveAppt() {
    this.http.put(`${this.apiUrl}/appointments/${this.currentAppt.appointment_id}`, {
      appointment_date: this.currentAppt.appointment_date,
      appointment_time: this.currentAppt.appointment_time
    }).subscribe({
      next: () => {
        this.loadAppointments();
        this.closeModal();
      },
      error: (err) => console.error("Error updating appointment", err)
    });
  }

  deleteAppt(id: number) {
    if(confirm('Are you sure you want to delete this appointment?')) {
      this.http.delete(`${this.apiUrl}/appointments/${id}`).subscribe({
        next: () => this.loadAppointments(),
        error: (err) => console.error("Error deleting appointment", err)
      });
    }
  }
}