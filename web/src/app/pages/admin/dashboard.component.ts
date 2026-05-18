import { Component, OnInit, HostBinding } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { NgApexchartsModule } from 'ng-apexcharts';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faArrowsRotate, faUsers, faUserMd, faCalendarCheck } from '@fortawesome/free-solid-svg-icons';
import { API_BASE_URL } from '../../config/api.config';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, NgApexchartsModule, FontAwesomeModule],
  template: `
    <div class="space-y-8">
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-3xl font-bold text-slate-900 dark:text-white">Analytics Dashboard</h2>
          <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">Hospital Performance Overview</p>
        </div>
        <button (click)="loadAnalytics()" class="flex items-center gap-2 px-4 py-2.5 bg-teal-600 hover:bg-teal-700 dark:bg-teal-700 dark:hover:bg-teal-600 text-white rounded-lg text-sm font-medium transition-colors shadow-sm">
          <fa-icon [icon]="faArrowsRotate"></fa-icon> Refresh
        </button>
      </div>

      <!-- KPI Cards -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800/50 p-6 flex flex-col hover:shadow-md dark:hover:shadow-lg transition-shadow">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 rounded-lg bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <fa-icon [icon]="faUsers" class="text-xl"></fa-icon>
            </div>
            <div>
              <p class="text-sm font-medium text-slate-500 dark:text-slate-400">Total Patients</p>
              <h3 class="text-2xl font-bold text-slate-900 dark:text-white">{{ metrics.patients }}</h3>
            </div>
          </div>
        </div>

        <div class="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800/50 p-6 flex flex-col hover:shadow-md dark:hover:shadow-lg transition-shadow">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <fa-icon [icon]="faUserMd" class="text-xl"></fa-icon>
            </div>
            <div>
              <p class="text-sm font-medium text-slate-500 dark:text-slate-400">Total Doctors</p>
              <h3 class="text-2xl font-bold text-slate-900 dark:text-white">{{ metrics.doctors }}</h3>
            </div>
          </div>
        </div>

        <div class="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800/50 p-6 flex flex-col hover:shadow-md dark:hover:shadow-lg transition-shadow">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 rounded-lg bg-violet-50 dark:bg-violet-900/30 flex items-center justify-center text-violet-600 dark:text-violet-400">
              <fa-icon [icon]="faCalendarCheck" class="text-xl"></fa-icon>
            </div>
            <div>
              <p class="text-sm font-medium text-slate-500 dark:text-slate-400">Total Appointments</p>
              <h3 class="text-2xl font-bold text-slate-900 dark:text-white">{{ metrics.appointments }}</h3>
            </div>
          </div>
        </div>
      </div>

      <!-- Charts -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Status Distribution Chart -->
        <div class="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800/50 p-6">
          <h3 class="text-lg font-semibold text-slate-900 dark:text-white mb-4">Appointment Status Distribution</h3>
          <apx-chart *ngIf="statusChartOptions"
            [series]="statusChartOptions.series"
            [chart]="statusChartOptions.chart"
            [labels]="statusChartOptions.labels"
            [colors]="statusChartOptions.colors"
            [legend]="statusChartOptions.legend"
            [responsive]="statusChartOptions.responsive"
          ></apx-chart>
          <div *ngIf="!statusChartOptions" class="h-64 flex items-center justify-center text-slate-400 dark:text-slate-500">
            Loading chart...
          </div>
        </div>
      </div>
    </div>
  `
})
export class DashboardComponent implements OnInit {
  metrics = { patients: 0, doctors: 0, appointments: 0 };
  statusChartOptions: any;
  faArrowsRotate = faArrowsRotate;
  faUsers = faUsers;
  faUserMd = faUserMd;
  faCalendarCheck = faCalendarCheck;

  @HostBinding('class.dark') isDark = true;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadAnalytics();
  }

  loadAnalytics() {
    const apiUrl = API_BASE_URL + '/api';
    this.http.get<any>(`${apiUrl}/admin/analytics`).subscribe({
      next: (res) => {
        this.metrics.patients = res.metrics.find((m: any) => m.label === 'Total Patients')?.value || 0;
        this.metrics.doctors = res.metrics.find((m: any) => m.label === 'Total Doctors')?.value || 0;
        this.metrics.appointments = res.metrics.find((m: any) => m.label === 'Total Appointments')?.value || 0;
        this.setupStatusChart(res.appointment_status_distribution);
      },
      error: (err) => console.error("Error loading analytics", err)
    });
  }

  setupStatusChart(distribution: any) {
    const labels = Object.keys(distribution || {});
    const series = Object.values(distribution || {}) as number[];
    
    // Map colors to common statuses - using teal theme
    const colors = labels.map(l => {
      switch(l.toLowerCase()) {
        case 'scheduled': return '#06b6d4'; // cyan
        case 'completed': return '#10b981'; // emerald
        case 'cancelled': return '#ef4444'; // red
        default: return '#64748b'; // slate
      }
    });

    if (series.length === 0) {
      labels.push('No Appointments');
      series.push(1);
    }

    this.statusChartOptions = {
      series: series,
      chart: { 
        type: "donut", 
        height: 320, 
        animations: { enabled: true },
        background: 'transparent',
        foreColor: '#64748b'
      },
      labels: labels,
      colors: colors.length > 0 ? colors : undefined,
      legend: { position: "bottom", labels: { colors: '#64748b' } },
      responsive: [
        {
          breakpoint: 480,
          options: {
            chart: { width: 200 },
            legend: { position: "bottom" }
          }
        }
      ]
    };
  }
}