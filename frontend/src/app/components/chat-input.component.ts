import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faPaperPlane } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-chat-input',
  standalone: true,
  imports: [CommonModule, FormsModule, FontAwesomeModule],
  template: `
    <div class="p-4 bg-transparent border-t-0 fixed bottom-0 left-0 w-full bg-linear-to-t from-white via-white dark:from-slate-900 dark:via-slate-900 to-transparent">
      <div class="max-w-3xl mx-auto flex gap-2 mb-3 overflow-x-auto no-scrollbar">
        <button *ngFor="let chip of suggestions" (click)="send(chip)" 
          class="shrink-0 px-4 py-1.5 text-xs font-medium rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-cyan-100 dark:hover:bg-cyan-900/50 hover:text-cyan-600 dark:hover:text-cyan-400 transition-all duration-300 ease-in-out border border-slate-200 dark:border-slate-700">
          {{ chip }}
        </button>
      </div>
      
      <div class="max-w-3xl mx-auto flex items-center gap-2 relative shadow-lg rounded-full border border-slate-200 dark:border-slate-700">
        <input 
          type="text" 
          [(ngModel)]="message" 
          (keyup.enter)="send(message)"
          placeholder="Message Reception AI..." 
          class="w-full pl-6 pr-12 py-4 bg-white dark:bg-slate-800 border-none rounded-full outline-none focus:ring-0 transition-all duration-300 text-slate-800 dark:text-slate-100 placeholder-slate-400" />
        <button 
          (click)="send(message)"
          class="absolute right-3 px-3 py-2 rounded-full text-white bg-slate-800 dark:bg-slate-100 dark:text-slate-900 hover:bg-slate-700 dark:hover:bg-slate-300 transition-all duration-300 ease-in-out">
          <fa-icon [icon]="faPaperPlane"></fa-icon>
        </button>
      </div>
      <div class="text-center text-xs text-slate-400 dark:text-slate-500 mt-3 mb-1">
        AI can make mistakes. Consider verifying important information.
      </div>
    </div>
  `
})
export class ChatInputComponent {
  message = '';
  suggestions = ['Book an appointment', 'Operating hours', 'Meet the doctors'];
  @Output() onSubmit = new EventEmitter<string>();
  faPaperPlane = faPaperPlane;

  send(text: string) {
    if (text.trim()) {
      this.onSubmit.emit(text.trim());
      this.message = '';
    }
  }
}
