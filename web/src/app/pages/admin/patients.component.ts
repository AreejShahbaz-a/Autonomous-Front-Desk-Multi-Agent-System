import { Component, OnInit, HostBinding } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faPencil, faTrash, faPlus, faTimes } from '@fortawesome/free-solid-svg-icons';
import { API_BASE_URL } from '../../config/api.config';

@Component({
  selector: 'app-patients',
  standalone: true,
  imports: [CommonModule, FormsModule, FontAwesomeModule],
  template: `
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <h2 class="text-2xl font-bold text-slate-900 dark:text-white">Manage Patients</h2>
        <button (click)="openModal()" class="px-4 py-2 bg-teal-600 hover:bg-teal-700 dark:bg-teal-700 dark:hover:bg-teal-600 text-white rounded-lg text-sm font-medium transition shadow-sm flex items-center gap-2">
          <fa-icon [icon]="faPlus"></fa-icon> Add Patient
        </button>
      </div>

      <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/50 rounded-xl shadow-sm overflow-hidden">
        <table class="min-w-full divide-y divide-slate-200 dark:divide-slate-800/50">
          <thead class="bg-slate-50 dark:bg-slate-800/50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-slate-600 dark:text-slate-300 uppercase tracking-wider">Number (ID)</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-slate-600 dark:text-slate-300 uppercase tracking-wider">Name</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-slate-600 dark:text-slate-300 uppercase tracking-wider">Contact</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-slate-600 dark:text-slate-300 uppercase tracking-wider">Email</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-slate-600 dark:text-slate-300 uppercase tracking-wider">Gender</th>
              <th class="px-6 py-3 text-right text-xs font-medium text-slate-600 dark:text-slate-300 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody class="bg-white dark:bg-slate-900 divide-y divide-slate-200 dark:divide-slate-800/50">
            <tr *ngFor="let pat of patients" class="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900 dark:text-white">{{pat.patient_number}}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-300"><div class="flex items-center gap-2"><fa-icon [icon]="faPlus" class="text-slate-400 dark:text-slate-500"></fa-icon> {{pat.patient_name}}</div></td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-300">{{pat.contact}}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-300">{{pat.email}}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm">
                <span class="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium" 
                  [ngClass]="pat.gender === 'Male' ? 'bg-cyan-50 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300 ring-1 ring-inset ring-cyan-600/20 dark:ring-cyan-500/30' : (pat.gender === 'Female' ? 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 ring-1 ring-inset ring-red-600/20 dark:ring-red-500/30' : 'bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-300 ring-1 ring-inset ring-slate-600/20 dark:ring-slate-500/30')">
                  {{pat.gender || 'N/A'}}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button (click)="openModal(pat)" class="text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 mr-3 px-2 py-1 rounded hover:bg-teal-50 dark:hover:bg-teal-900/30 transition"><fa-icon [icon]="faPencil"></fa-icon></button>
                <button (click)="deletePatient(pat.patient_number)" class="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 px-2 py-1 rounded hover:bg-red-50 dark:hover:bg-red-900/30 transition"><fa-icon [icon]="faTrash"></fa-icon></button>
              </td>
            </tr>
            <tr *ngIf="patients.length === 0">
              <td colspan="6" class="px-6 py-12 text-center text-slate-500 dark:text-slate-400 text-sm">
                No patients found. Add a patient to get started.
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Modal -->
      <div *ngIf="showModal" class="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm">
        <div class="bg-white dark:bg-slate-900 rounded-xl shadow-2xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-800/50">
          <div class="flex justify-between items-center mb-5">
            <h3 class="text-lg font-bold text-slate-900 dark:text-white">{{ isEditing ? 'Edit Patient' : 'Add New Patient' }}</h3>
            <button (click)="closeModal()" class="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
              <fa-icon [icon]="faTimes"></fa-icon>
            </button>
          </div>
          
          <form (ngSubmit)="savePatient()" class="space-y-4">
            <div><label class="block text-sm font-semibold text-slate-700 dark:text-slate-200">Patient Number (ID)</label>
              <input name="id" [(ngModel)]="currentPat.patient_number" [disabled]="isEditing" required class="mt-1 block w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-teal-500 focus:border-teal-500 sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed" />
            </div>
            <div><label class="block text-sm font-semibold text-slate-700 dark:text-slate-200">Name</label>
              <input name="name" [(ngModel)]="currentPat.patient_name" required class="mt-1 block w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-teal-500 focus:border-teal-500 sm:text-sm" />
            </div>
            <div><label class="block text-sm font-semibold text-slate-700 dark:text-slate-200">Contact</label>
              <input name="contact" [(ngModel)]="currentPat.contact" class="mt-1 block w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-teal-500 focus:border-teal-500 sm:text-sm" />
            </div>
            <div><label class="block text-sm font-semibold text-slate-700 dark:text-slate-200">Email</label>
              <input name="email" type="email" [(ngModel)]="currentPat.email" class="mt-1 block w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-teal-500 focus:border-teal-500 sm:text-sm" />
            </div>
            <div><label class="block text-sm font-semibold text-slate-700 dark:text-slate-200">Gender</label>
              <select name="gender" [(ngModel)]="currentPat.gender" class="mt-1 block w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-teal-500 focus:border-teal-500 sm:text-sm">
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div><label class="block text-sm font-semibold text-slate-700 dark:text-slate-200">Address</label>
              <input name="address" [(ngModel)]="currentPat.address" class="mt-1 block w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-teal-500 focus:border-teal-500 sm:text-sm" />
            </div>

            <div class="pt-4 flex justify-end gap-3">
              <button type="button" (click)="closeModal()" class="bg-white dark:bg-slate-800 py-2 px-4 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-slate-900 focus:ring-teal-500 transition-colors">Cancel</button>
              <button type="submit" class="bg-teal-600 hover:bg-teal-700 dark:bg-teal-700 dark:hover:bg-teal-600 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-slate-900 focus:ring-teal-500 transition-colors">Save</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `
})
export class PatientsComponent implements OnInit {
  patients: any[] = [];
  showModal = false;
  isEditing = false;
  currentPat: any = {};
  apiUrl = API_BASE_URL + '/api/admin';
  
  faPencil = faPencil;
  faTrash = faTrash;
  faPlus = faPlus;
  faTimes = faTimes;

  @HostBinding('class.dark') isDark = true;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadPatients();
  }

  loadPatients() {
    this.http.get<any[]>(`${this.apiUrl}/patients`).subscribe({
      next: (res) => this.patients = res,
      error: (err) => console.error("Error loading patients", err)
    });
  }

  openModal(pat?: any) {
    if (pat) {
      this.isEditing = true;
      this.currentPat = { ...pat };
    } else {
      this.isEditing = false;
      this.currentPat = { patient_number: '', patient_name: '', gender: 'Male' };
    }
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
  }

  savePatient() {
    if (this.isEditing) {
      this.http.put(`${this.apiUrl}/patients/${this.currentPat.patient_number}`, this.currentPat).subscribe({
        next: () => {
          this.loadPatients();
          this.closeModal();
        },
        error: (err) => console.error("Error updating patient", err)
      });
    } else {
      this.http.post(`${this.apiUrl}/patients`, this.currentPat).subscribe({
        next: () => {
          this.loadPatients();
          this.closeModal();
        },
        error: (err) => console.error("Error creating patient", err)
      });
    }
  }

  deletePatient(id: string) {
    if(confirm('Are you sure you want to delete this patient?')) {
      this.http.delete(`${this.apiUrl}/patients/${id}`).subscribe({
        next: () => this.loadPatients(),
        error: (err) => console.error("Error deleting patient", err)
      });
    }
  }
}