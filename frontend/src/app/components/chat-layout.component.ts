import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChatWindowComponent } from './chat-window.component';
import { ChatInputComponent } from './chat-input.component';
import { ChatService } from '../services/chat.service';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faMoon, faSun } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-chat-layout',
  standalone: true,
  imports: [CommonModule, ChatWindowComponent, ChatInputComponent, FontAwesomeModule],
  template: `
    <div class="flex flex-col h-screen w-full bg-slate-50 dark:bg-slate-900 shadow-2xl relative transition-colors duration-300">
      
      <!-- Sticky Header -->
      <header class="flex items-center justify-between px-6 py-4 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-10 w-full">
        <div>
          <h1 class="font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <div class="w-2 h-2 rounded-full bg-cyan-500 animate-pulse"></div>
            Reception AI
          </h1>
          <p class="text-xs text-slate-500 dark:text-slate-400">Always online</p>
        </div>
        <button (click)="toggleTheme()" class="p-2 rounded-full text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
          <fa-icon [icon]="isDark ? faSun : faMoon"></fa-icon>
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
    </div>
  `
})
export class ChatLayoutComponent implements OnInit {
  chatService = inject(ChatService);
  isDark = true;
  faMoon = faMoon;
  faSun = faSun;

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
