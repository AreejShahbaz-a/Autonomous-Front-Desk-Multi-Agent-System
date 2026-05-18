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
        <h2 class="text-2xl font-bold text-gray-900">Manage Patients</h2>
        <button (click)="openModal()" class="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition shadow-sm flex items-center gap-2">
          <i class="ph ph-plus font-bold"></i> Add Patient
        </button>
      </div>

      <div class="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <table class="min-w-full divide-y border-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Number (ID)</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Gender</th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr *ngFor="let pat of patients" class="hover:bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{{pat.patient_number}}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500"><div class="flex items-center gap-2"><i class="ph ph-user-circle text-gray-400"></i> {{pat.patient_name}}</div></td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{pat.contact}}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{pat.email}}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <span class="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium" 
                  [ngClass]="pat.gender === 'Male' ? 'bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-700/10' : (pat.gender === 'Female' ? 'bg-pink-50 text-pink-700 ring-1 ring-inset ring-pink-700/10' : 'bg-gray-50 text-gray-600 ring-1 ring-inset ring-gray-500/10')">
                  {{pat.gender || 'N/A'}}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button (click)="openModal(pat)" class="text-blue-600 hover:text-blue-900 mr-3 px-2 py-1 rounded hover:bg-blue-50 transition"><i class="ph ph-pencil-simple md:text-lg"></i></button>
                <button (click)="deletePatient(pat.patient_number)" class="text-red-600 hover:text-red-900 px-2 py-1 rounded hover:bg-red-50 transition"><i class="ph ph-trash md:text-lg"></i></button>
              </td>
            </tr>
            <tr *ngIf="patients.length === 0">
              <td colspan="6" class="px-6 py-12 text-center text-gray-500 text-sm">
                No patients found. Add a patient to get started.
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Modal -->
      <div *ngIf="showModal" class="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
        <div class="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
          <div class="flex justify-between items-center mb-5">
            <h3 class="text-lg font-bold text-gray-900">{{ isEditing ? 'Edit Patient' : 'Add Patient' }}</h3>
            <button (click)="closeModal()" class="text-gray-400 hover:text-gray-600">
              <i class="ph ph-x text-xl"></i>
            </button>
          </div>
          
          <form (ngSubmit)="savePatient()" class="space-y-4">
            <div><label class="block text-sm font-medium text-gray-700">Patient Number (ID)</label>
              <input name="id" [(ngModel)]="currentPat.patient_number" [disabled]="isEditing" required class="mt-1 block w-full px-3 py-2 border rounded-md shadow-sm border-gray-300 focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:bg-gray-100 disabled:text-gray-500" />
            </div>
            <div><label class="block text-sm font-medium text-gray-700">Name</label>
              <input name="name" [(ngModel)]="currentPat.patient_name" required class="mt-1 block w-full px-3 py-2 border rounded-md shadow-sm border-gray-300 focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
            </div>
            <div><label class="block text-sm font-medium text-gray-700">Contact</label>
              <input name="contact" [(ngModel)]="currentPat.contact" class="mt-1 block w-full px-3 py-2 border rounded-md shadow-sm border-gray-300 focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
            </div>
            <div><label class="block text-sm font-medium text-gray-700">Email</label>
              <input name="email" type="email" [(ngModel)]="currentPat.email" class="mt-1 block w-full px-3 py-2 border rounded-md shadow-sm border-gray-300 focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
            </div>
            <div><label class="block text-sm font-medium text-gray-700">Gender</label>
              <select name="gender" [(ngModel)]="currentPat.gender" class="mt-1 block w-full px-3 py-2 border rounded-md shadow-sm border-gray-300 focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div><label class="block text-sm font-medium text-gray-700">Address</label>
              <input name="address" [(ngModel)]="currentPat.address" class="mt-1 block w-full px-3 py-2 border rounded-md shadow-sm border-gray-300 focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
            </div>

            <div class="pt-4 flex justify-end gap-3">
              <button type="button" (click)="closeModal()" class="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">Cancel</button>
              <button type="submit" class="bg-blue-600 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">Save</button>
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