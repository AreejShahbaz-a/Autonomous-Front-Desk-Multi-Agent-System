import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { animate, style, transition, trigger } from '@angular/animations';
import { ChatWindowComponent } from './chat-window.component';
import { ChatInputComponent } from './chat-input.component';
import { ChatService } from '../services/chat.service';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faMoon, faSun, faPlus, faBars, faMessage, faStethoscope } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-chat-layout',
  standalone: true,
  imports: [CommonModule, ChatWindowComponent, ChatInputComponent, FontAwesomeModule],
  animations: [
    trigger('fade', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('200ms', style({ opacity: 1 }))
      ]),
      transition(':leave', [
        animate('200ms', style({ opacity: 0 }))
      ])
    ])
  ],
  template: `
    <div class="flex h-screen w-full bg-slate-50 dark:bg-slate-900 transition-colors duration-300 overflow-hidden text-slate-800 dark:text-slate-100">
      
      <!-- Sidebar -->
      <aside 
        class="w-64 shrink-0 bg-slate-100/80 dark:bg-slate-950/80 backdrop-blur-xl flex flex-col transition-all duration-300 border-r border-slate-200 dark:border-slate-800/50"
        [ngClass]="{'hidden md:flex': !isSidebarOpen, 'flex absolute z-50 h-full w-72 shadow-2xl': isSidebarOpen}">
        
        <div class="px-3 py-4 border-b border-slate-200 dark:border-slate-800/50 md:hidden flex justify-between items-center">
          <div class="font-semibold flex items-center gap-2 text-teal-600 dark:text-teal-400">
            <fa-icon [icon]="faStethoscope"></fa-icon> Reception AI
          </div>
          <button (click)="toggleSidebar()" class="p-2 mr-1 rounded-md text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors">
            <fa-icon [icon]="faBars"></fa-icon>
          </button>
        </div>

        <div class="px-3 py-3">
          <button (click)="createNewChat()" class="flex items-center gap-2 w-full px-3 py-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/50 hover:border-teal-500/50 hover:shadow-md dark:hover:border-teal-500/50 transition-all text-teal-600 dark:text-teal-400 font-medium">
            <fa-icon [icon]="faPlus" class="text-sm"></fa-icon>
            <span class="text-sm">New Consultation</span>
          </button>
        </div>

        <div class="flex-1 overflow-y-auto px-3 py-2 space-y-1">
          <div class="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 px-2 mt-2">Recent History</div>
          
          <button *ngFor="let session of (chatService.sessions$ | async)" 
            (click)="selectSession(session.id)"
            class="flex items-center gap-2 w-full px-3 py-2.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800/80 transition-colors text-left truncate group"
            [ngClass]="{'bg-slate-200 dark:bg-slate-800 text-teal-700 dark:text-teal-300 font-medium': session.id === (chatService.activeSessionId$ | async)}">
            <fa-icon [icon]="faMessage" class="text-xs opacity-50 group-hover:opacity-100 transition-opacity"></fa-icon>
            <span class="text-sm truncate">{{ session.title }}</span>
          </button>
        </div>
        
        <div class="px-4 py-4 border-t border-slate-200 dark:border-slate-800/50 flex items-center justify-between mt-auto bg-slate-50 dark:bg-slate-900/50 rounded-b-xl m-2">
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 rounded-full bg-teal-100 dark:bg-teal-900/50 flex items-center justify-center text-teal-600 dark:text-teal-400 font-bold text-xs border border-teal-200 dark:border-teal-800/50">DR</div>
            <div class="text-sm font-medium">Dr. Patient</div>
          </div>
        </div>
      </aside>

      <!-- Main Chat Area -->
      <main class="flex-1 flex flex-col h-full relative min-w-0 bg-white dark:bg-[#0B1120]">
        
        <!-- Mobile Header -->
        <header class="md:hidden flex items-center justify-between px-4 py-3 bg-white/80 dark:bg-[#0B1120]/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800/50 sticky top-0 z-10 w-full">
          <div class="flex items-center gap-2">
            <button (click)="toggleSidebar()" class="p-2 -ml-2 rounded-md text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
              <fa-icon [icon]="faBars"></fa-icon>
            </button>
            <span class="font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <fa-icon [icon]="faStethoscope" class="text-teal-500"></fa-icon> Reception
            </span>
          </div>
          <button (click)="toggleTheme()" class="p-2 rounded-full text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-lg" aria-label="Toggle Theme">
            <fa-icon [icon]="isDark ? faSun : faMoon"></fa-icon>
          </button>
        </header>

        <!-- Desktop Header / Model Selector -->
        <header class="hidden md:flex items-center justify-between px-6 py-4 sticky top-0 z-10 w-full bg-white/80 dark:bg-[#0B1120]/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800/50 shadow-sm">
          <div>
            <h1 class="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-3 text-xl">
              <div class="w-8 h-8 rounded-lg bg-teal-50 dark:bg-teal-900/30 flex items-center justify-center text-teal-600 dark:text-teal-400 border border-teal-200 dark:border-teal-800/50">
                <fa-icon [icon]="faStethoscope" class="text-sm"></fa-icon>
              </div>
              MediCare AI
              <span class="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-xs font-medium border border-slate-200 dark:border-slate-700">Health Desk</span>
            </h1>
          </div>
          
          <button (click)="toggleTheme()" class="p-2.5 rounded-full text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors tooltip-trigger relative group" aria-label="Toggle Theme">
            <fa-icon [icon]="isDark ? faSun : faMoon" class="text-lg"></fa-icon>
            <span class="absolute -bottom-8 right-0 bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap hidden md:block pointer-events-none">Toggle theme</span>
          </button>
        </header>

        <!-- Scrollable Window -->
        <app-chat-window 
          class="flex-1 flex flex-col overflow-hidden"
          [messages]="(chatService.messages$ | async) || []" 
          [isTyping]="(chatService.isTyping$ | async) || false">
        </app-chat-window>

        <!-- Sticky Input -->
        <app-chat-input (onSubmit)="sendMessage($event)" class="block sticky bottom-0 mt-auto z-10 w-full"></app-chat-input>
        
        <!-- Mobile Backdrop -->
        <div *ngIf="isSidebarOpen" @fade (click)="toggleSidebar()" class="absolute inset-0 bg-slate-900/60 z-40 md:hidden backdrop-blur-sm"></div>
      </main>
    </div>
  `
})
export class ChatLayoutComponent implements OnInit {
  chatService = inject(ChatService);
  isDark = true;
  isSidebarOpen = false;
  faMoon = faMoon;
  faSun = faSun;
  faPlus = faPlus;
  faBars = faBars;
  faMessage = faMessage;
  faStethoscope = faStethoscope;

  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  createNewChat() {
    this.chatService.createNewSession();
    if (window.innerWidth < 768) {
      this.isSidebarOpen = false;
    }
  }

  selectSession(id: string) {
    this.chatService.setActiveSession(id);
    if (window.innerWidth < 768) {
      this.isSidebarOpen = false;
    }
  }

  ngOnInit() {
    this.checkTheme();
  }

  sendMessage(content: string) {
    this.chatService.sendMessage(content);
  }

  toggleTheme() {
    this.isDark = !this.isDark;
    const html = document.documentElement;
    if (this.isDark) {
      html.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      html.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }

  checkTheme() {
    if (localStorage.getItem('theme') === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.classList.add('dark');
      this.isDark = true;
    } else {
      document.documentElement.classList.remove('dark');
      this.isDark = false;
    }
  }
}
