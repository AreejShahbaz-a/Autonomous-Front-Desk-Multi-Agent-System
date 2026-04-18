import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faRobot } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-typing-indicator',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule],
  template: `
    <div class="flex items-center gap-3 text-slate-500 dark:text-slate-400 p-2">
      <div class="w-8 h-8 rounded-full bg-cyan-100 dark:bg-cyan-900 flex items-center justify-center">
         <fa-icon [icon]="faRobot" class="text-cyan-600 dark:text-cyan-400 text-sm"></fa-icon>
      </div>
      <div class="flex space-x-1.5 self-end mb-2">
        <div class="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-bounce" style="animation-delay: 0ms"></div>
        <div class="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-bounce" style="animation-delay: 150ms"></div>
        <div class="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-bounce" style="animation-delay: 300ms"></div>
      </div>
    </div>
  `
})
export class TypingIndicatorComponent {
  faRobot = faRobot;
}
