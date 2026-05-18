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
        <h2 class="text-2xl font-bold text-gray-900">Manage Appointments</h2>
      </div>

      <div class="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <table class="min-w-full divide-y border-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Doctor</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date & Time</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr *ngFor="let appt of appointments" class="hover:bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">#{{appt.appointment_id}}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500"><div class="flex items-center gap-2"><i class="ph ph-user text-gray-400"></i> {{appt.patient_name}}</div></td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500"><div class="flex items-center gap-2"><i class="ph ph-stethoscope text-gray-400"></i> Dr. {{appt.doctor_name}}</div></td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <div class="flex flex-col">
                  <span class="font-medium text-gray-900">{{appt.appointment_date}}</span>
                  <span>{{appt.appointment_time}}</span>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <select [ngModel]="appt.status" (ngModelChange)="updateStatus(appt, $event)"
                  class="text-sm rounded-md border-gray-300 py-1 pl-2 pr-6 focus:ring-blue-500 focus:border-blue-500"
                  [ngClass]="{
                    'bg-blue-50 text-blue-700': appt.status === 'scheduled',
                    'bg-green-50 text-green-700': appt.status === 'completed',
                    'bg-red-50 text-red-700': appt.status === 'cancelled'
                  }">
                  <option value="scheduled">Scheduled</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button (click)="openModal(appt)" class="text-blue-600 hover:text-blue-900 mr-3 px-2 py-1 rounded hover:bg-blue-50 transition"><i class="ph ph-pencil-simple md:text-lg"></i></button>
                <button (click)="deleteAppt(appt.appointment_id)" class="text-red-600 hover:text-red-900 px-2 py-1 rounded hover:bg-red-50 transition"><i class="ph ph-trash md:text-lg"></i></button>
              </td>
            </tr>
            <tr *ngIf="appointments.length === 0">
              <td colspan="6" class="px-6 py-12 text-center text-gray-500 text-sm">
                No appointments found.
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Reschedule Modal -->
      <div *ngIf="showModal" class="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
        <div class="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
          <div class="flex justify-between items-center mb-5">
            <h3 class="text-lg font-bold text-gray-900">Reschedule Appointment</h3>
            <button (click)="closeModal()" class="text-gray-400 hover:text-gray-600">
              <i class="ph ph-x text-xl"></i>
            </button>
          </div>
          
          <form (ngSubmit)="saveAppt()" class="space-y-4">
            <div><label class="block text-sm font-medium text-gray-700">Date</label>
              <input name="date" type="date" [(ngModel)]="currentAppt.appointment_date" required class="mt-1 block w-full px-3 py-2 border rounded-md shadow-sm border-gray-300 focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
            </div>
            <div><label class="block text-sm font-medium text-gray-700">Time</label>
              <input name="time" type="time" [(ngModel)]="currentAppt.appointment_time" required class="mt-1 block w-full px-3 py-2 border rounded-md shadow-sm border-gray-300 focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
            </div>

            <div class="pt-4 flex justify-end gap-3">
              <button type="button" (click)="closeModal()" class="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">Cancel</button>
              <button type="submit" class="bg-blue-600 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">Save Changes</button>
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