import { Component, OnInit, HostBinding } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faPencil, faTrash, faPlus, faTimes } from '@fortawesome/free-solid-svg-icons';
import { API_BASE_URL } from '../../config/api.config';

@Component({
  selector: 'app-doctors',
  standalone: true,
  imports: [CommonModule, FormsModule, FontAwesomeModule],
  template: `
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-3xl font-bold text-slate-900 dark:text-white">Manage Doctors</h2>
          <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">Add, edit, and remove doctors from the system</p>
        </div>
        <button (click)="openModal()" class="px-4 py-2.5 bg-teal-600 hover:bg-teal-700 dark:bg-teal-700 dark:hover:bg-teal-600 text-white rounded-lg text-sm font-medium transition-colors shadow-sm flex items-center gap-2">
          <fa-icon [icon]="faPlus"></fa-icon> Add Doctor
        </button>
      </div>

      <!-- Table -->
      <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/50 rounded-xl shadow-sm overflow-hidden">
        <table class="min-w-full divide-y divide-slate-200 dark:divide-slate-800/50">
          <thead class="bg-slate-50 dark:bg-slate-800/50">
            <tr>
              <th scope="col" class="px-6 py-4 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">ID</th>
              <th scope="col" class="px-6 py-4 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">Name</th>
              <th scope="col" class="px-6 py-4 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">Specialization</th>
              <th scope="col" class="px-6 py-4 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">Email</th>
              <th scope="col" class="px-6 py-4 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">Schedule</th>
              <th scope="col" class="px-6 py-4 text-right text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody class="bg-white dark:bg-slate-900 divide-y divide-slate-200 dark:divide-slate-800/50">
            <tr *ngFor="let doc of doctors" class="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">\n              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900 dark:text-white">{{doc.doctor_id}}</td>\n              <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-300"><div class="flex items-center gap-2">{{doc.doctor_name}}</div></td>\n              <td class="px-6 py-4 whitespace-nowrap text-sm"><span class="inline-flex items-center rounded-full bg-emerald-50 dark:bg-emerald-900/30 px-3 py-1 text-xs font-medium text-emerald-700 dark:text-emerald-300 ring-1 ring-inset ring-emerald-600/20 dark:ring-emerald-500/30\">{{doc.specialization}}</span></td>\n              <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-300\">{{doc.email}}</td>\n              <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-300\">{{doc.available_days}}</td>\n              <td class=\"px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2\">\n                <button (click)=\"openModal(doc)\" class=\"text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 px-2 py-1 rounded hover:bg-teal-50 dark:hover:bg-teal-900/30 transition-colors\"><fa-icon [icon]=\"faPencil\"></fa-icon></button>\n                <button (click)=\"deleteDoctor(doc.doctor_id)\" class=\"text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 px-2 py-1 rounded hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors\"><fa-icon [icon]=\"faTrash\"></fa-icon></button>\n              </td>\n            </tr>\n            <tr *ngIf=\"doctors.length === 0\">\n              <td colspan=\"6\" class=\"px-6 py-12 text-center text-slate-500 dark:text-slate-400 text-sm\">\n                No doctors found. Add a doctor to get started.\n              </td>\n            </tr>\n          </tbody>\n        </table>\n      </div>\n\n      <!-- Modal -->\n      <div *ngIf=\"showModal\" class=\"fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm\">\n        <div class=\"bg-white dark:bg-slate-900 rounded-xl shadow-2xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-800/50\">\n          <div class=\"flex justify-between items-center mb-5\">\n            <h3 class=\"text-xl font-bold text-slate-900 dark:text-white\">{{ isEditing ? 'Edit Doctor' : 'Add New Doctor' }}</h3>\n            <button (click)=\"closeModal()\" class=\"text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors\">\n              <fa-icon [icon]=\"faTimes\"></fa-icon>\n            </button>\n          </div>\n          \n          <form (ngSubmit)=\"saveDoctor()\" class=\"space-y-4\">\n            <div>\n              <label class=\"block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1\">Doctor ID</label>\n              <input name=\"id\" [(ngModel)]=\"currentDoc.doctor_id\" [disabled]=\"isEditing\" required class=\"w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-teal-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed transition-colors sm:text-sm\" />\n            </div>\n            <div>\n              <label class=\"block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1\">Name</label>\n              <input name=\"name\" [(ngModel)]=\"currentDoc.doctor_name\" required class=\"w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-teal-500 focus:border-transparent sm:text-sm\" />\n            </div>\n            <div>\n              <label class=\"block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1\">Specialization</label>\n              <input name=\"spec\" [(ngModel)]=\"currentDoc.specialization\" required class=\"w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-teal-500 focus:border-transparent sm:text-sm\" />\n            </div>\n            <div>\n              <label class=\"block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1\">Email</label>\n              <input name=\"email\" type=\"email\" [(ngModel)]=\"currentDoc.email\" class=\"w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-teal-500 focus:border-transparent sm:text-sm\" />\n            </div>\n            <div>\n              <label class=\"block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1\">Phone</label>\n              <input name=\"phone\" [(ngModel)]=\"currentDoc.phone\" class=\"w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-teal-500 focus:border-transparent sm:text-sm\" />\n            </div>\n            <div>\n              <label class=\"block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1\">Available Days</label>\n              <input name=\"days\" [(ngModel)]=\"currentDoc.available_days\" placeholder=\"e.g. Mon, Wed, Fri\" class=\"w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-teal-500 focus:border-transparent sm:text-sm\" />\n            </div>\n\n            <div class=\"pt-4 flex justify-end gap-3\">\n              <button type=\"button\" (click)=\"closeModal()\" class=\"bg-white dark:bg-slate-800 py-2 px-4 border border-slate-300 dark:border-slate-600 rounded-lg shadow-sm text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-slate-900 focus:ring-teal-500 transition-colors\">Cancel</button>\n              <button type=\"submit\" class=\"bg-teal-600 hover:bg-teal-700 dark:bg-teal-700 dark:hover:bg-teal-600 py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-slate-900 focus:ring-teal-500 transition-colors\">Save</button>\n            </div>\n          </form>\n        </div>\n      </div>\n    </div>\n  `\n})\nexport class DoctorsComponent implements OnInit {\n  doctors: any[] = [];\n  showModal = false;\n  isEditing = false;\n  currentDoc: any = {};\n  apiUrl = API_BASE_URL + '/api/admin';\n  \n  faPencil = faPencil;\n  faTrash = faTrash;\n  faPlus = faPlus;\n  faTimes = faTimes;\n\n  @HostBinding('class.dark') isDark = true;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadDoctors();
  }

  loadDoctors() {
    this.http.get<any[]>(`${this.apiUrl}/doctors`).subscribe({
      next: (res) => this.doctors = res,
      error: (err) => console.error("Error loading doctors", err)
    });
  }

  openModal(doc?: any) {
    if (doc) {
      this.isEditing = true;
      this.currentDoc = { ...doc };
    } else {
      this.isEditing = false;
      this.currentDoc = { doctor_id: '', doctor_name: '', specialization: '' };
    }
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
  }

  saveDoctor() {
    if (this.isEditing) {
      this.http.put(`${this.apiUrl}/doctors/${this.currentDoc.doctor_id}`, this.currentDoc).subscribe({
        next: () => {
          this.loadDoctors();
          this.closeModal();
        },
        error: (err) => console.error("Error updating doctor", err)
      });
    } else {
      this.http.post(`${this.apiUrl}/doctors`, this.currentDoc).subscribe({
        next: () => {
          this.loadDoctors();
          this.closeModal();
        },
        error: (err) => console.error("Error creating doctor", err)
      });
    }
  }

  deleteDoctor(id: string) {
    if(confirm('Are you sure you want to delete this doctor?')) {
      this.http.delete(`${this.apiUrl}/doctors/${id}`).subscribe({
        next: () => this.loadDoctors(),
        error: (err) => console.error("Error deleting doctor", err)
      });
    }
  }
}