import { Component, HostBinding } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faStethoscope, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { API_BASE_URL } from '../../config/api.config';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, FontAwesomeModule],
  template: `
    <div class="min-h-screen bg-slate-50 dark:bg-[#0B1120] flex flex-col justify-center py-12 sm:px-6 lg:px-8 transition-colors duration-300">
      <div class="sm:mx-auto sm:w-full sm:max-w-md">
        <div class="flex justify-center mb-4">
          <div class="w-14 h-14 rounded-lg bg-teal-50 dark:bg-teal-900/30 flex items-center justify-center text-teal-600 dark:text-teal-400 border border-teal-200 dark:border-teal-800/50 shadow-sm">
            <fa-icon [icon]="faStethoscope" class="text-2xl"></fa-icon>
          </div>
        </div>
        <h2 class="mt-6 text-center text-3xl font-bold text-slate-900 dark:text-white">
          Admin Login
        </h2>
        <p class="mt-2 text-center text-sm text-slate-600 dark:text-slate-400">MediCare - Autonomous Front Desk</p>
      </div>

      <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div class="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm py-8 px-4 shadow-lg sm:rounded-xl sm:px-10 border border-slate-200 dark:border-slate-800/50">
          <form class="space-y-6" (ngSubmit)="onSubmit()">
            <div>
              <label for="email" class="block text-sm font-semibold text-slate-700 dark:text-slate-200">Email address</label>
              <div class="mt-2">
                <input id="email" name="email" type="email" autocomplete="email" required [(ngModel)]="email"
                  class="block w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg shadow-sm placeholder-slate-400 dark:placeholder-slate-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-colors sm:text-sm">
              </div>
            </div>

            <div>
              <label for="password" class="block text-sm font-semibold text-slate-700 dark:text-slate-200">Password</label>
              <div class="mt-2">
                <input id="password" name="password" type="password" autocomplete="current-password" required [(ngModel)]="password"
                  class="block w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg shadow-sm placeholder-slate-400 dark:placeholder-slate-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-colors sm:text-sm">
              </div>
            </div>

            <div *ngIf="error" class="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-3 rounded-lg border border-red-200 dark:border-red-800/50">
              {{ error }}
            </div>

            <div>
              <button type="submit" [disabled]="loading"
                class="w-full flex justify-center items-center gap-2 py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-slate-900 focus:ring-teal-500 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200">
                <fa-icon *ngIf="loading" [icon]="faSpinner" class="animate-spin"></fa-icon>
                <span>{{ loading ? 'Signing in...' : 'Sign in' }}</span>
              </button>
            </div>

            <div class="text-center text-xs text-slate-500 dark:text-slate-400 font-medium">
              <p>Demo Credentials:<br/><code class="text-slate-600 dark:text-slate-300">admin@medicare.com</code> / <code class="text-slate-600 dark:text-slate-300">admin123</code></p>
            </div>
          </form>
        </div>
      </div>
    </div>
  `
})
export class LoginComponent {
  email = 'admin@medicare.com'; // Default test credentials prepopulated
  password = 'admin123';
  loading = false;
  error = '';

  constructor(private http: HttpClient, private router: Router) {}

  onSubmit() {
    this.loading = true;
    this.error = '';
    
    // Fallback if environment doesn't exist
    const apiUrl = API_BASE_URL + '/api';
    
    this.http.post<any>(`${apiUrl}/admin/auth/login`, {
      email: this.email,
      password: this.password
    }).subscribe({
      next: (res) => {
        localStorage.setItem('adminToken', res.access_token);
        this.router.navigate(['/admin/dashboard']);
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Invalid email or password';
        this.loading = false;
      }
    });
  }
}