import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterModule } from '@angular/router';
import { Router } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faChartBar, faUserMd, faUsers, faCalendarAlt, faSignOutAlt, faBars } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterModule, FontAwesomeModule],
  template: `
    <div class="flex h-screen w-full bg-[#0B1120] text-slate-100 overflow-hidden">
      <!-- Sidebar -->
      <aside 
        class="w-64 shrink-0 bg-slate-950/80 backdrop-blur-xl border-r border-slate-800/50 flex flex-col transition-all duration-300"
        [ngClass]="{'hidden md:flex': !isSidebarOpen, 'flex absolute z-50 h-full w-64 shadow-2xl': isSidebarOpen}">
        <div class="h-16 flex justify-between items-center px-6 border-b border-slate-800/50">
          <h1 class="text-xl font-bold text-teal-400">Medicare Admin</h1>
          <button (click)="toggleSidebar()" class="md:hidden p-2 rounded-md text-slate-400 hover:bg-slate-800 transition-colors">
            <fa-icon [icon]="faBars"></fa-icon>
          </button>
        </div>
        <nav class="p-4 space-y-2 flex-1">
          <a routerLink="/admin/dashboard" routerLinkActive="bg-slate-800 text-teal-400 font-medium border-teal-500/50" 
             class="flex items-center px-4 py-3 text-slate-300 rounded-xl hover:bg-slate-800/80 transition-colors border border-transparent">
             <fa-icon [icon]="faChartBar" class="text-lg mr-3"></fa-icon> Dashboard
          </a>
          <a routerLink="/admin/appointments" routerLinkActive="bg-slate-800 text-teal-400 font-medium border-teal-500/50"
             class="flex items-center px-4 py-3 text-slate-300 rounded-xl hover:bg-slate-800/80 transition-colors border border-transparent">
             <fa-icon [icon]="faCalendarAlt" class="text-lg mr-3"></fa-icon> Appointments
          </a>
          <a routerLink="/admin/doctors" routerLinkActive="bg-slate-800 text-teal-400 font-medium border-teal-500/50"
             class="flex items-center px-4 py-3 text-slate-300 rounded-xl hover:bg-slate-800/80 transition-colors border border-transparent">
             <fa-icon [icon]="faUserMd" class="text-lg mr-3"></fa-icon> Doctors
          </a>
          <a routerLink="/admin/patients" routerLinkActive="bg-slate-800 text-teal-400 font-medium border-teal-500/50"
             class="flex items-center px-4 py-3 text-slate-300 rounded-xl hover:bg-slate-800/80 transition-colors border border-transparent">
             <fa-icon [icon]="faUsers" class="text-lg mr-3"></fa-icon> Patients
          </a>
        </nav>
        
        <div class="p-4 border-t border-slate-800/50">
          <button (click)="logout()" class="flex items-center w-full px-4 py-3 text-red-400 rounded-xl hover:bg-red-900/30 transition-colors">
            <fa-icon [icon]="faSignOutAlt" class="text-lg mr-3"></fa-icon> Logout
          </button>
        </div>
      </aside>

      <!-- Main Content -->
      <main class="flex-1 overflow-y-auto relative bg-[#0B1120]">
        <header class="h-16 bg-[#0B1120]/80 backdrop-blur-md border-b border-slate-800/50 flex items-center justify-between px-6 sticky top-0 z-10 w-full shadow-sm">
          <div class="flex items-center gap-4">
            <button (click)="toggleSidebar()" class="md:hidden p-2 -ml-2 rounded-md text-slate-400 hover:bg-slate-800 transition-colors">
              <fa-icon [icon]="faBars"></fa-icon>
            </button>
            <h2 class="text-lg font-semibold text-slate-100">Portal Control</h2>
          </div>
          <div class="flex items-center gap-4">
            <div class="h-8 w-8 bg-teal-900/50 rounded-full flex items-center justify-center text-teal-400 font-bold border border-teal-800/50">A</div>
          </div>
        </header>
        <div class="p-6 md:p-8">
          <router-outlet></router-outlet>
        </div>
        
        <!-- Mobile Backdrop -->
        <div *ngIf="isSidebarOpen" (click)="toggleSidebar()" class="absolute inset-0 bg-slate-900/60 z-40 md:hidden backdrop-blur-sm transition-opacity"></div>
      </main>
    </div>
  `
})
export class AdminLayoutComponent implements OnInit {
  isSidebarOpen = false;
  
  faChartBar = faChartBar;
  faUserMd = faUserMd;
  faUsers = faUsers;
  faCalendarAlt = faCalendarAlt;
  faSignOutAlt = faSignOutAlt;
  faBars = faBars;

  constructor(private router: Router) {
    document.documentElement.classList.add('dark');
  }
  
  ngOnInit() {}

  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  logout() {
    localStorage.removeItem('adminToken');
    this.router.navigate(['/admin/login']);
  }
}