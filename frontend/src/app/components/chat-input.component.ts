import { Component, EventEmitter, Output, inject, OnInit } from '@angular/core';
import { ChatService } from '../services/chat.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faPaperPlane } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-chat-input',
  standalone: true,
  imports: [CommonModule, FormsModule, FontAwesomeModule],
  template: `
    <div class="p-4 bg-transparent border-t-0 fixed bottom-0 left-0 right-0 w-full md:pl-64 bg-linear-to-t from-white via-white dark:from-[#0B1120] dark:via-[#0B1120] to-transparent pointer-events-none">
      <div class="pointer-events-auto">
        <div *ngIf="suggestions.length > 0" class="max-w-3xl mx-auto flex gap-2 mb-3 overflow-x-auto no-scrollbar px-4">
          <button *ngFor="let chip of suggestions" (click)="send(chip)" 
            class="shrink-0 px-4 py-1.5 text-xs font-semibold rounded-full bg-white dark:bg-slate-800 text-teal-700 dark:text-teal-300 hover:bg-teal-50 hover:text-teal-800 dark:hover:bg-slate-700 dark:hover:text-teal-200 transition-all duration-300 ease-in-out border border-teal-100 dark:border-slate-700 shadow-sm">
            {{ chip }}
          </button>
        </div>
        
        <div class="max-w-3xl flex items-center gap-2 relative shadow-lg rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 mx-4 md:mx-auto">
          <input 
            type="text" 
            [(ngModel)]="message" 
            (keyup.enter)="send(message)"
            placeholder="Type a message or choose an action (e.g. Register patient)" 
            class="w-full pl-5 pr-14 py-4 bg-transparent border-none outline-none focus:ring-0 transition-all duration-300 text-slate-800 dark:text-slate-100 placeholder-slate-400 font-medium" />
          <button 
            (click)="send(message)"
            [disabled]="!message.trim()"
            class="absolute right-2 px-3 py-2 rounded-xl text-white bg-teal-600 dark:bg-teal-500 hover:bg-teal-700 dark:hover:bg-teal-400 transition-all duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed">
            <fa-icon [icon]="faPaperPlane"></fa-icon>
          </button>
        </div>
        <div class="text-center text-xs text-slate-400 dark:text-slate-500 mt-3 mb-1 font-medium">
          MediCare AI can make mistakes. Always consult a healthcare professional.
        </div>
      </div>
    </div>
  `
})
export class ChatInputComponent {
  message = '';
  // Persistent session-level action chips shown at start of each session
  suggestions = ['Register patient', 'Book an appointment', 'Show appointments', 'General inquiry'];
  // Tracks whether the user has sent their first message in this session
  firstMessageSent = false;
  private chatService = inject(ChatService);
  private initialSuggestions = ['Register patient', 'Book an appointment', 'Show appointments', 'General inquiry'];
  @Output() onSubmit = new EventEmitter<string>();
  faPaperPlane = faPaperPlane;

  constructor() {
    // Watch for session message changes to reset suggestion chips at session start
    this.chatService.messages$.subscribe((msgs) => {
      if (!msgs || msgs.length === 0) {
        // New/empty session: show initial chips and mark as not-sent
        this.firstMessageSent = false;
        this.suggestions = [...this.initialSuggestions];
      }
    });
  }

  send(text: string) {
    if (text.trim()) {
      this.onSubmit.emit(text.trim());
      this.message = '';
      // Clear suggestion chips only after the user's first message
      if (!this.firstMessageSent) {
        this.firstMessageSent = true;
        this.suggestions = [];
      }
    }
  }
}
