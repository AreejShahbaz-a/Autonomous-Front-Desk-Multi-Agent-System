import { Component, OnInit, HostBinding } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faPencil, faTrash, faTimes, faExclamationTriangle, faSpinner } from '@fortawesome/free-solid-svg-icons';
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
              <th class="px-6 py-3 text-right text-xs font-medium text-slate-600 dark:text-slate-300 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody class="bg-white dark:bg-slate-900 divide-y divide-slate-200 dark:divide-slate-800/50">
            <tr *ngFor="let appt of paginatedAppointments" class="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
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
                <select [ngModel]="appt.status" (ngModelChange)="confirmStatusChange(appt, $event)"
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
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button (click)="openModal(appt)" class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 hover:bg-teal-100 dark:hover:bg-teal-900/50 border border-teal-200/50 dark:border-teal-800/30 transition-all duration-200 shadow-sm hover:shadow hover:scale-[1.02] transform">
                  <fa-icon [icon]="faPencil" class="text-2xs"></fa-icon>
                  <span>Reschedule</span>
                </button>
              </td>
            </tr>
            <tr *ngIf="loading">
              <td colspan="6" class="px-6 py-12 text-center text-slate-500 dark:text-slate-400 text-sm">
                <div class="flex flex-col items-center justify-center gap-3 py-6">
                  <fa-icon [icon]="faSpinner" class="animate-spin text-teal-600 dark:text-teal-400 text-2xl"></fa-icon>
                  <span class="text-slate-500 dark:text-slate-400 font-medium">Loading appointments...</span>
                </div>
              </td>
            </tr>
            <tr *ngIf="!loading && appointments.length === 0">
              <td colspan="6" class="px-6 py-12 text-center text-slate-500 dark:text-slate-400 text-sm">
                No appointments found.
              </td>
            </tr>
          </tbody>
        </table>

        <!-- Pagination Footer -->
        <div *ngIf="appointments.length > 0" class="flex items-center justify-between px-6 py-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800/50">
          <div class="flex-1 flex justify-between sm:hidden">
            <button (click)="previousPage()" [disabled]="currentPage === 1" class="relative inline-flex items-center px-4 py-2 border border-slate-300 dark:border-slate-600 text-sm font-semibold rounded-lg text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 transition disabled:opacity-50">
              Previous
            </button>
            <button (click)="nextPage()" [disabled]="currentPage === totalPages" class="ml-3 relative inline-flex items-center px-4 py-2 border border-slate-300 dark:border-slate-600 text-sm font-semibold rounded-lg text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 transition disabled:opacity-50">
              Next
            </button>
          </div>
          <div class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p class="text-sm text-slate-600 dark:text-slate-400 font-medium">
                Showing
                <span class="font-bold text-slate-900 dark:text-white">{{ startIndex }}</span>
                to
                <span class="font-bold text-slate-900 dark:text-white">{{ endIndex }}</span>
                of
                <span class="font-bold text-slate-900 dark:text-white">{{ totalAppointments }}</span>
                appointments
              </p>
            </div>
            <div>
              <nav class="relative z-0 inline-flex rounded-lg shadow-sm -space-x-px" aria-label="Pagination">
                <button (click)="previousPage()" [disabled]="currentPage === 1" class="relative inline-flex items-center px-3 py-2 rounded-l-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm font-semibold text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 transition disabled:opacity-50">
                  <span class="sr-only">Previous</span>
                  <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd" />
                  </svg>
                </button>
                
                <button *ngFor="let page of [].constructor(totalPages); let i = index" 
                  (click)="setPage(i + 1)"
                  [ngClass]="{
                    'z-10 bg-teal-50 dark:bg-teal-950/30 border-teal-500 text-teal-600 dark:text-teal-400': currentPage === i + 1,
                    'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700': currentPage !== i + 1
                  }"
                  class="relative inline-flex items-center px-4 py-2 border text-sm font-semibold transition">
                  {{ i + 1 }}
                </button>

                <button (click)="nextPage()" [disabled]="currentPage === totalPages" class="relative inline-flex items-center px-3 py-2 rounded-r-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm font-semibold text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 transition disabled:opacity-50">
                  <span class="sr-only">Next</span>
                  <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
                  </svg>
                </button>
              </nav>
            </div>
          </div>
        </div>
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
              <button type="button" [disabled]="savingReschedule" (click)="closeModal()" class="bg-white dark:bg-slate-800 py-2 px-4 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-slate-900 focus:ring-teal-500 transition-colors disabled:opacity-50">Cancel</button>
              <button type="submit" [disabled]="savingReschedule" class="bg-teal-600 hover:bg-teal-700 dark:bg-teal-700 dark:hover:bg-teal-600 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-slate-900 focus:ring-teal-500 transition-colors disabled:opacity-50 inline-flex items-center gap-2">
                <fa-icon *ngIf="savingReschedule" [icon]="faSpinner" class="animate-spin text-xs"></fa-icon>
                <span>{{ savingReschedule ? 'Saving...' : 'Save Changes' }}</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Custom Status Confirmation Modal -->
      <div *ngIf="showStatusModal" class="fixed inset-0 bg-black/60 dark:bg-black/80 flex items-center justify-center z-50 backdrop-blur-sm">
        <div class="bg-white dark:bg-slate-900 rounded-xl shadow-2xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-800/50 transform transition-all duration-300">
          <div class="flex items-center gap-3 mb-4 text-amber-500 dark:text-amber-400">
            <div class="p-2 bg-amber-50 dark:bg-amber-950/30 rounded-lg">
              <fa-icon [icon]="faExclamationTriangle" class="text-xl"></fa-icon>
            </div>
            <h3 class="text-lg font-bold text-slate-900 dark:text-white">Confirm Status Update</h3>
          </div>
          
          <div class="space-y-3">
            <p class="text-sm text-slate-600 dark:text-slate-300">
              Are you sure you want to change the status of this appointment to <span class="font-semibold capitalize text-teal-600 dark:text-teal-400">{{ pendingStatus }}</span>?
            </p>
            <div class="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg text-xs space-y-1.5 text-slate-500 dark:text-slate-400">
              <div><span class="font-semibold">Patient:</span> {{ pendingAppt?.patient_name }}</div>
              <div><span class="font-semibold">Doctor:</span> Dr. {{ pendingAppt?.doctor_name }}</div>
              <div><span class="font-semibold">Current Status:</span> <span class="capitalize">{{ pendingAppt?.status }}</span></div>
            </div>
          </div>

          <div class="mt-6 flex justify-end gap-3">
            <button type="button" [disabled]="savingStatus" (click)="cancelStatusChange()" class="bg-white dark:bg-slate-800 py-2 px-4 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 focus:outline-none transition-colors disabled:opacity-50">Cancel</button>
            <button type="button" [disabled]="savingStatus" (click)="saveStatusChange()" class="bg-teal-600 hover:bg-teal-700 dark:bg-teal-700 dark:hover:bg-teal-600 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white focus:outline-none transition-colors disabled:opacity-50 inline-flex items-center gap-2">
              <fa-icon *ngIf="savingStatus" [icon]="faSpinner" class="animate-spin text-xs"></fa-icon>
              <span>{{ savingStatus ? 'Updating...' : 'Confirm Update' }}</span>
            </button>
          </div>
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

  currentPage = 1;
  pageSize = 10;

  loading = false;
  savingStatus = false;
  savingReschedule = false;

  showStatusModal = false;
  pendingAppt: any = null;
  pendingStatus = '';
  
  faPencil = faPencil;
  faTrash = faTrash;
  faTimes = faTimes;
  faExclamationTriangle = faExclamationTriangle;
  faSpinner = faSpinner;

  @HostBinding('class.dark') isDark = true;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadAppointments();
  }

  loadAppointments() {
    this.loading = true;
    this.http.get<any[]>(`${this.apiUrl}/appointments`).subscribe({
      next: (res) => {
        this.appointments = res;
        this.loading = false;
        if (this.currentPage > this.totalPages && this.totalPages > 0) {
          this.currentPage = this.totalPages;
        }
      },
      error: (err) => {
        console.error("Error loading appointments", err);
        this.loading = false;
      }
    });
  }

  get paginatedAppointments(): any[] {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    return this.appointments.slice(startIndex, startIndex + this.pageSize);
  }

  get totalPages(): number {
    return Math.ceil(this.appointments.length / this.pageSize);
  }

  get totalAppointments(): number {
    return this.appointments.length;
  }

  get startIndex(): number {
    return this.appointments.length === 0 ? 0 : (this.currentPage - 1) * this.pageSize + 1;
  }

  get endIndex(): number {
    return Math.min(this.currentPage * this.pageSize, this.totalAppointments);
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }

  setPage(page: number) {
    this.currentPage = page;
  }

  confirmStatusChange(appt: any, newStatus: string) {
    this.pendingAppt = appt;
    this.pendingStatus = newStatus;
    this.showStatusModal = true;
  }

  cancelStatusChange() {
    this.showStatusModal = false;
    this.pendingAppt = null;
    this.pendingStatus = '';
    this.savingStatus = false;
    // Reload to revert the dropdown select value in UI
    this.loadAppointments();
  }

  saveStatusChange() {
    if (this.pendingAppt && this.pendingStatus) {
      this.savingStatus = true;
      this.http.put(`${this.apiUrl}/appointments/${this.pendingAppt.appointment_id}`, { status: this.pendingStatus }).subscribe({
        next: () => {
          this.loadAppointments();
          this.showStatusModal = false;
          this.pendingAppt = null;
          this.pendingStatus = '';
          this.savingStatus = false;
        },
        error: (err) => {
          console.error("Error updating status", err);
          this.savingStatus = false;
          this.cancelStatusChange();
        }
      });
    }
  }

  openModal(appt: any) {
    this.currentAppt = { ...appt };
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
  }

  saveAppt() {
    this.savingReschedule = true;
    this.http.put(`${this.apiUrl}/appointments/${this.currentAppt.appointment_id}`, {
      appointment_date: this.currentAppt.appointment_date,
      appointment_time: this.currentAppt.appointment_time
    }).subscribe({
      next: () => {
        this.loadAppointments();
        this.closeModal();
        this.savingReschedule = false;
      },
      error: (err) => {
        console.error("Error updating appointment", err);
        this.savingReschedule = false;
      }
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