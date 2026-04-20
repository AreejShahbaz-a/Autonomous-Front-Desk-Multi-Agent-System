import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faRobot } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-typing-indicator',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule],
  template: `
    <div class="flex w-full justify-center py-4 bg-slate-50 dark:bg-slate-900 border-y border-slate-100 dark:border-slate-800/50">
      <div class="flex w-full max-w-3xl gap-5 px-4 m-auto">
        <div class="shrink-0 w-8 h-8 rounded-lg flex items-center justify-center bg-teal-600 dark:bg-teal-500 shadow-sm border border-teal-500 dark:border-teal-400 mt-0.5">
           <fa-icon [icon]="faRobot" class="text-white text-sm"></fa-icon>
        </div>
        <div class="flex space-x-1.5 items-center pt-1.5">
          <div class="w-1.5 h-1.5 bg-slate-400 dark:bg-slate-500 rounded-full animate-bounce" style="animation-delay: 0ms"></div>
          <div class="w-1.5 h-1.5 bg-slate-400 dark:bg-slate-500 rounded-full animate-bounce" style="animation-delay: 150ms"></div>
          <div class="w-1.5 h-1.5 bg-slate-400 dark:bg-slate-500 rounded-full animate-bounce" style="animation-delay: 300ms"></div>
        </div>
      </div>
    </div>
  `
})
export class TypingIndicatorComponent {
  faRobot = faRobot;
}
