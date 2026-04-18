import { Component, Input, HostBinding } from '@angular/core';
import { CommonModule } from '@angular/common';
import { trigger, style, animate, transition } from '@angular/animations';
import { Message } from '../models/message.model';

@Component({
  selector: 'app-chat-message',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex w-full justify-center py-4" [ngClass]="{'bg-white dark:bg-[#0B1120]': isUser, 'bg-slate-50 dark:bg-slate-900 border-y border-slate-100 dark:border-slate-800/50': !isUser}">
      <div class="flex w-full max-w-3xl gap-5 px-4 m-auto">
        <!-- Optional: Avatar placeholders -->
        <div class="shrink-0 w-8 h-8 rounded-lg flex items-center justify-center font-bold text-white text-xs mt-0.5 shadow-sm border"
             [ngClass]="isUser ? 'bg-slate-800 dark:bg-slate-700 border-slate-700 dark:border-slate-600' : 'bg-teal-600 dark:bg-teal-500 border-teal-500 dark:border-teal-400'">
          {{ isUser ? 'U' : 'AI' }}
        </div>
        
        <div class="flex-1 text-sm sm:text-base leading-relaxed text-slate-800 dark:text-slate-200 py-1 font-medium">
          {{ message.content }}
        </div>
      </div>
    </div>
  `,
  animations: [
    trigger('slideInUp', [
      transition(':enter', [
        style({ transform: 'translateY(10px)', opacity: 0 }),
        animate('300ms ease-out', style({ transform: 'translateY(0)', opacity: 1 }))
      ])
    ])
  ]
})
export class ChatMessageComponent {
  @Input({ required: true }) message!: Message;
  @HostBinding('@slideInUp') animation = true;

  get isUser(): boolean {
    return this.message.role === 'user';
  }
}
