import { Component, OnInit, HostBinding } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faPencil, faTrash, faPlus, faTimes, faSpinner, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import { API_BASE_URL } from '../../config/api.config';

@Component({
  selector: 'app-doctors',
  standalone: true,
  imports: [CommonModule, FormsModule, FontAwesomeModule],
  template: `
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-3xl font-bold text-white">Manage Doctors</h2>
          <p class="text-sm text-slate-400 mt-1">Add, edit, and remove doctors from the system</p>
        </div>
        <button (click)="openModal()" class="px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm flex items-center gap-2">
          <fa-icon [icon]="faPlus"></fa-icon> Add Doctor
        </button>
      </div>

      <!-- Table -->
      <div class="bg-slate-900 border border-slate-800/50 rounded-xl shadow-sm overflow-hidden">
        <table class="min-w-full divide-y divide-slate-800/50">
          <thead class="bg-slate-800/50">
            <tr>
              <th scope="col" class="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">ID</th>
              <th scope="col" class="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">Name</th>
              <th scope="col" class="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">Specialization</th>
              <th scope="col" class="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">Email</th>
              <th scope="col" class="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">Schedule</th>
              <th scope="col" class="px-6 py-4 text-right text-xs font-semibold text-slate-300 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody class="bg-slate-900 divide-y divide-slate-800/50">
            <ng-container *ngIf="!loading">
              <tr *ngFor="let doc of paginatedDoctors" class="hover:bg-slate-800/50 transition-colors">
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{{doc.doctor_id}}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-300">{{doc.doctor_name}}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm"><span class="inline-flex items-center rounded-full bg-emerald-900/30 px-3 py-1 text-xs font-medium text-emerald-300 ring-1 ring-inset ring-emerald-500/30">{{doc.specialization}}</span></td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-300">{{doc.email}}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-300">{{doc.available_days}}</td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                  <button (click)="openModal(doc)" class="text-teal-400 hover:text-teal-300 px-2 py-1 rounded hover:bg-teal-900/30 transition-colors"><fa-icon [icon]="faPencil"></fa-icon></button>
                  <button (click)="confirmDelete(doc)" class="text-red-400 hover:text-red-300 px-2 py-1 rounded hover:bg-red-900/30 transition-colors"><fa-icon [icon]="faTrash"></fa-icon></button>
                </td>
              </tr>
            </ng-container>
            <tr *ngIf="loading">
              <td colspan="6" class="px-6 py-12 text-center text-slate-400 text-sm">
                <div class="flex flex-col items-center justify-center gap-3 py-6">
                  <fa-icon [icon]="faSpinner" class="animate-spin text-teal-500 text-2xl"></fa-icon>
                  <span class="text-slate-400 font-medium">Loading doctors...</span>
                </div>
              </td>
            </tr>
            <tr *ngIf="!loading && doctors.length === 0">
              <td colspan="6" class="px-6 py-12 text-center text-slate-400 text-sm">
                No doctors found. Add a doctor to get started.
              </td>
            </tr>
          </tbody>
        </table>

        <!-- Pagination Footer -->
        <div *ngIf="doctors.length > 0" class="flex items-center justify-between px-6 py-4 bg-slate-900 border-t border-slate-800/50">
          <div class="flex-1 flex justify-between sm:hidden">
            <button (click)="previousPage()" [disabled]="currentPage === 1" class="relative inline-flex items-center px-4 py-2 border border-slate-700 text-sm font-semibold rounded-lg text-slate-200 bg-slate-800 hover:bg-slate-700/80 transition disabled:opacity-50">
              Previous
            </button>
            <button (click)="nextPage()" [disabled]="currentPage === totalPages" class="ml-3 relative inline-flex items-center px-4 py-2 border border-slate-700 text-sm font-semibold rounded-lg text-slate-200 bg-slate-800 hover:bg-slate-700/80 transition disabled:opacity-50">
              Next
            </button>
          </div>
          <div class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p class="text-sm text-slate-400 font-medium">
                Showing
                <span class="font-bold text-white">{{ startIndex }}</span>
                to
                <span class="font-bold text-white">{{ endIndex }}</span>
                of
                <span class="font-bold text-white">{{ totalDoctors }}</span>
                doctors
              </p>
            </div>
            <div>
              <nav class="relative z-0 inline-flex rounded-lg shadow-sm -space-x-px" aria-label="Pagination">
                <button (click)="previousPage()" [disabled]="currentPage === 1" class="relative inline-flex items-center px-3 py-2 rounded-l-lg border border-slate-700 bg-slate-800 text-sm font-semibold text-slate-400 hover:bg-slate-700/80 transition disabled:opacity-50">
                  <span class="sr-only">Previous</span>
                  <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd" />
                  </svg>
                </button>
                
                <button *ngFor="let page of [].constructor(totalPages); let i = index" 
                  (click)="setPage(i + 1)"
                  [ngClass]="{
                    'z-10 bg-teal-500/20 border-teal-500/50 text-teal-300': currentPage === i + 1,
                    'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700/80': currentPage !== i + 1
                  }"
                  class="relative inline-flex items-center px-4 py-2 border text-sm font-semibold transition">
                  {{ i + 1 }}
                </button>
 
                <button (click)="nextPage()" [disabled]="currentPage === totalPages" class="relative inline-flex items-center px-3 py-2 rounded-r-lg border border-slate-700 bg-slate-800 text-sm font-semibold text-slate-400 hover:bg-slate-700/80 transition disabled:opacity-50">
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

      <!-- Modal -->
      <div *ngIf="showModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
        <div class="bg-slate-900 rounded-xl shadow-2xl max-w-md w-full p-6 border border-slate-800/50">
          <div class="flex justify-between items-center mb-5">
            <h3 class="text-xl font-bold text-white">{{ isEditing ? 'Edit Doctor' : 'Add New Doctor' }}</h3>
            <button (click)="closeModal()" class="text-slate-400 hover:text-slate-300 transition-colors">
              <fa-icon [icon]="faTimes"></fa-icon>
            </button>
          </div>
          
          <form (ngSubmit)="saveDoctor()" class="space-y-4">
            <div>
              <label class="block text-sm font-semibold text-slate-200 mb-1">Doctor ID (Auto-generated)</label>
              <input name="id" [(ngModel)]="currentDoc.doctor_id" disabled required class="w-full px-4 py-2 border border-slate-700 rounded-lg bg-slate-800/40 text-slate-400 cursor-not-allowed transition-colors sm:text-sm" />
            </div>
            <div>
              <label class="block text-sm font-semibold text-slate-200 mb-1">Name</label>
              <input name="name" [(ngModel)]="currentDoc.doctor_name" [disabled]="savingDoctor" required class="w-full px-4 py-2 border border-slate-650 rounded-lg bg-slate-800 text-white placeholder-slate-500 focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-colors sm:text-sm disabled:opacity-50" />
            </div>
            <div class="relative">
              <label class="block text-sm font-semibold text-slate-200 mb-1">Specialization</label>
              <input type="text"
                name="spec"
                [(ngModel)]="currentDoc.specialization"
                [disabled]="savingDoctor"
                (focus)="showSpecDropdown = true"
                (blur)="closeSpecDropdownWithDelay()"
                (input)="filterSpecializations()"
                placeholder="Search or select specialization..."
                required
                autocomplete="off"
                class="w-full px-4 py-2 border border-slate-650 rounded-lg bg-slate-800 text-white placeholder-slate-500 focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-colors sm:text-sm disabled:opacity-50" />
              
              <!-- Searchable Dropdown List -->
              <div *ngIf="showSpecDropdown && filteredSpecializations.length > 0" class="absolute z-50 w-full mt-1 max-h-48 overflow-y-auto bg-slate-800 border border-slate-700 rounded-lg shadow-xl divide-y divide-slate-700/50">
                <button type="button" *ngFor="let spec of filteredSpecializations"
                  (mousedown)="selectSpecialization(spec)"
                  class="w-full px-4 py-2.5 text-left text-sm text-slate-200 hover:bg-teal-650 hover:text-white transition-colors cursor-pointer select-none">
                  {{ spec }}
                </button>
              </div>
            </div>
            <div>
              <label class="block text-sm font-semibold text-slate-200 mb-1">Email</label>
              <input name="email" type="email" [(ngModel)]="currentDoc.email" [disabled]="savingDoctor" class="w-full px-4 py-2 border border-slate-650 rounded-lg bg-slate-800 text-white placeholder-slate-500 focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-colors sm:text-sm disabled:opacity-50" />
            </div>
            <div>
              <label class="block text-sm font-semibold text-slate-200 mb-1">Phone</label>
              <input name="phone" [(ngModel)]="currentDoc.phone" [disabled]="savingDoctor" class="w-full px-4 py-2 border border-slate-650 rounded-lg bg-slate-800 text-white placeholder-slate-500 focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-colors sm:text-sm disabled:opacity-50" />
            </div>
            <div>
              <label class="block text-sm font-semibold text-slate-200 mb-2">Available Days</label>
              <div class="flex flex-wrap gap-2">
                <button type="button" *ngFor="let day of weekdays"
                  [disabled]="savingDoctor"
                  (click)="toggleDay(day)"
                  [ngClass]="{
                    'bg-teal-500/20 text-teal-300 border-teal-500/50 shadow-sm shadow-teal-500/10': isDaySelected(day),
                    'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700/50 hover:text-slate-300': !isDaySelected(day)
                  }"
                  class="px-3 py-1.5 rounded-full text-xs font-semibold border transition-all duration-200 cursor-pointer select-none disabled:opacity-50 disabled:cursor-not-allowed">
                  {{ day }}
                </button>
              </div>
              <input type="hidden" name="available_days" [(ngModel)]="currentDoc.available_days" />
            </div>

            <div class="pt-4 flex justify-end gap-3">
              <button type="button" [disabled]="savingDoctor" (click)="closeModal()" class="bg-slate-800 py-2 px-4 border border-slate-600 rounded-lg shadow-sm text-sm font-medium text-slate-200 hover:bg-slate-700 focus:outline-none transition-colors disabled:opacity-50">Cancel</button>
              <button type="submit" [disabled]="savingDoctor" class="bg-teal-600 hover:bg-teal-700 py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white focus:outline-none transition-colors disabled:opacity-50 inline-flex items-center gap-2">
                <fa-icon *ngIf="savingDoctor" [icon]="faSpinner" class="animate-spin text-xs"></fa-icon>
                <span>{{ savingDoctor ? (isEditing ? 'Saving...' : 'Adding...') : 'Save' }}</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Custom Delete Confirmation Modal -->
      <div *ngIf="showDeleteModal" class="fixed inset-0 bg-black/60 dark:bg-black/80 flex items-center justify-center z-50 backdrop-blur-sm">
        <div class="bg-slate-900 rounded-xl shadow-2xl max-w-md w-full p-6 border border-slate-800/50 transform transition-all duration-300">
          <div class="flex items-center gap-3 mb-4 text-red-500">
            <div class="p-2 bg-red-950/30 rounded-lg">
              <fa-icon [icon]="faExclamationTriangle" class="text-xl"></fa-icon>
            </div>
            <h3 class="text-lg font-bold text-white">Delete Doctor</h3>
          </div>
          
          <div class="space-y-3">
            <p class="text-sm text-slate-300">
              Are you sure you want to delete <span class="font-semibold text-red-400">{{ pendingDeleteName }}</span>? This action is permanent and cannot be undone.
            </p>
          </div>

          <div class="mt-6 flex justify-end gap-3">
            <button type="button" [disabled]="savingDelete" (click)="cancelDelete()" class="bg-slate-800 py-2 px-4 border border-slate-750 rounded-md shadow-sm text-sm font-medium text-slate-200 hover:bg-slate-700/80 focus:outline-none transition-colors disabled:opacity-50 cursor-pointer">Cancel</button>
            <button type="button" [disabled]="savingDelete" (click)="saveDelete()" class="bg-red-650 hover:bg-red-700 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white focus:outline-none transition-colors disabled:opacity-50 inline-flex items-center gap-2 cursor-pointer">
              <fa-icon *ngIf="savingDelete" [icon]="faSpinner" class="animate-spin text-xs"></fa-icon>
              <span>{{ savingDelete ? 'Deleting...' : 'Delete Doctor' }}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class DoctorsComponent implements OnInit {
  doctors: any[] = [];
  showModal = false;
  isEditing = false;
  currentDoc: any = {};
  apiUrl = API_BASE_URL + '/api/admin';

  faPencil = faPencil;
  faTrash = faTrash;
  faPlus = faPlus;
  faTimes = faTimes;
  faSpinner = faSpinner;
  faExclamationTriangle = faExclamationTriangle;

  specializations = [
    'Allergist',
    'Anesthesiologist',
    'Cardiologist',
    'Cardiothoracic Surgeon',
    'Dermatologist',
    'Emergency Medicine Specialist',
    'Endocrinologist',
    'ENT Specialist',
    'Gastroenterologist',
    'General Physician',
    'General Surgeon',
    'Geriatrician',
    'Gynecologist',
    'Immunologist',
    'Infectious Disease Specialist',
    'Nephrologist',
    'Neurologist',
    'Neurosurgeon',
    'Oncologist',
    'Ophthalmologist',
    'Orthopedic',
    'Orthopedic Surgeon',
    'Pain Management Specialist',
    'Pathologist',
    'Pediatric Surgeon',
    'Pediatrician',
    'Plastic Surgeon',
    'Psychiatrist',
    'Pulmonologist',
    'Radiologist',
    'Rheumatologist',
    'Sports Medicine Specialist',
    'Urologist',
    'Vascular Surgeon'
  ];

  weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  selectedDays: string[] = [];
  filteredSpecializations: string[] = [];
  showSpecDropdown = false;

  currentPage = 1;
  pageSize = 10;

  loading = false;
  savingDoctor = false;

  showDeleteModal = false;
  pendingDeleteId = '';
  pendingDeleteName = '';
  savingDelete = false;

  @HostBinding('class.dark') isDark = true;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadDoctors();
  }

  loadDoctors() {
    this.loading = true;
    this.http.get<any[]>(`${this.apiUrl}/doctors`).subscribe({
      next: (res) => {
        this.doctors = res;
        this.loading = false;
        if (this.currentPage > this.totalPages && this.totalPages > 0) {
          this.currentPage = this.totalPages;
        }
      },
      error: (err) => {
        console.error("Error loading doctors", err);
        this.loading = false;
      }
    });
  }

  get paginatedDoctors(): any[] {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    return this.doctors.slice(startIndex, startIndex + this.pageSize);
  }

  get totalPages(): number {
    return Math.ceil(this.doctors.length / this.pageSize);
  }

  get totalDoctors(): number {
    return this.doctors.length;
  }

  get startIndex(): number {
    return this.doctors.length === 0 ? 0 : (this.currentPage - 1) * this.pageSize + 1;
  }

  get endIndex(): number {
    return Math.min(this.currentPage * this.pageSize, this.totalDoctors);
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

  generateNextDoctorId(): string {
    let maxNum = 0;
    this.doctors.forEach(doc => {
      const id = doc.doctor_id;
      if (id && id.startsWith('D')) {
        const num = parseInt(id.substring(1), 10);
        if (!isNaN(num) && num > maxNum) {
          maxNum = num;
        }
      }
    });
    const nextNum = maxNum + 1;
    return 'D' + String(nextNum).padStart(3, '0');
  }

  openModal(doc?: any) {
    if (doc) {
      this.isEditing = true;
      this.currentDoc = { ...doc };
      this.selectedDays = this.currentDoc.available_days ? this.currentDoc.available_days.split(',').map((d: string) => d.trim()).filter((d: string) => d !== '') : [];
    } else {
      this.isEditing = false;
      this.currentDoc = { 
        doctor_id: this.generateNextDoctorId(), 
        doctor_name: '', 
        specialization: '', 
        email: '', 
        phone: '', 
        available_days: '' 
      };
      this.selectedDays = [];
    }
    this.filteredSpecializations = [...this.specializations];
    this.showModal = true;
  }

  filterSpecializations() {
    const query = (this.currentDoc.specialization || '').toLowerCase();
    this.filteredSpecializations = this.specializations.filter(s => s.toLowerCase().includes(query));
  }

  selectSpecialization(spec: string) {
    this.currentDoc.specialization = spec;
    this.showSpecDropdown = false;
  }

  closeSpecDropdownWithDelay() {
    setTimeout(() => {
      this.showSpecDropdown = false;
    }, 200);
  }

  toggleDay(day: string) {
    const idx = this.selectedDays.indexOf(day);
    if (idx > -1) {
      this.selectedDays.splice(idx, 1);
    } else {
      this.selectedDays.push(day);
    }
    this.selectedDays.sort((a, b) => this.weekdays.indexOf(a) - this.weekdays.indexOf(b));
    this.currentDoc.available_days = this.selectedDays.join(',');
  }

  isDaySelected(day: string): boolean {
    return this.selectedDays.includes(day);
  }

  closeModal() {
    this.showModal = false;
  }

  saveDoctor() {
    this.savingDoctor = true;
    if (this.isEditing) {
      this.http.put(`${this.apiUrl}/doctors/${this.currentDoc.doctor_id}`, this.currentDoc).subscribe({
        next: () => {
          this.loadDoctors();
          this.closeModal();
          this.savingDoctor = false;
        },
        error: (err) => {
          console.error("Error updating doctor", err);
          this.savingDoctor = false;
        }
      });
    } else {
      this.http.post(`${this.apiUrl}/doctors`, this.currentDoc).subscribe({
        next: () => {
          this.loadDoctors();
          this.closeModal();
          this.savingDoctor = false;
        },
        error: (err) => {
          console.error("Error creating doctor", err);
          this.savingDoctor = false;
        }
      });
    }
  }

  confirmDelete(doc: any) {
    this.pendingDeleteId = doc.doctor_id;
    this.pendingDeleteName = doc.doctor_name;
    this.showDeleteModal = true;
  }

  cancelDelete() {
    this.showDeleteModal = false;
    this.pendingDeleteId = '';
    this.pendingDeleteName = '';
    this.savingDelete = false;
  }

  saveDelete() {
    if (this.pendingDeleteId) {
      this.savingDelete = true;
      this.http.delete(`${this.apiUrl}/doctors/${this.pendingDeleteId}`).subscribe({
        next: () => {
          this.loadDoctors();
          this.cancelDelete();
        },
        error: (err) => {
          console.error("Error deleting doctor", err);
          this.cancelDelete();
        }
      });
    }
  }
}