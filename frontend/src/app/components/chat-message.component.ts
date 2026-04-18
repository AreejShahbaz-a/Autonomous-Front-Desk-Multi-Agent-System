import { Component, Input, HostBinding } from '@angular/core';
import { CommonModule } from '@angular/common';
import { trigger, style, animate, transition } from '@angular/animations';
import { Message } from '../models/message.model';

@Component({
  selector: 'app-chat-message',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex w-full justify-center py-4" [ngClass]="{'bg-slate-100 dark:bg-slate-800': !isUser}">
      <div class="flex w-full max-w-3xl gap-4 px-4 m-auto">
        <!-- Optional: Avatar placeholders -->
        <div class="shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-white text-xs mt-1"
             [ngClass]="isUser ? 'bg-blue-600' : 'bg-cyan-500'">
          {{ isUser ? 'U' : 'AI' }}
        </div>
        
        <div class="flex-1 text-sm sm:text-base leading-relaxed text-slate-800 dark:text-slate-100 py-1">
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
