import { Component, Input, ViewChild, ElementRef, AfterViewChecked, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChatMessageComponent } from './chat-message.component';
import { TypingIndicatorComponent } from './typing-indicator.component';
import { Message } from '../models/message.model';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faStethoscope } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-chat-window',
  standalone: true,
  imports: [CommonModule, ChatMessageComponent, TypingIndicatorComponent, FontAwesomeModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div #scrollContainer class="flex-1 overflow-y-auto w-full pb-32">
      <div class="w-full flex justify-center py-10 mb-2 mt-4">
        <div class="text-center">
          <div class="w-16 h-16 bg-teal-100 dark:bg-teal-900/40 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-teal-200 dark:border-teal-800/50">
            <fa-icon [icon]="faStethoscope" class="text-3xl text-teal-600 dark:text-teal-400"></fa-icon>
          </div>
          <h2 class="text-2xl font-bold text-slate-800 dark:text-slate-100">How can I help you today?</h2>
          <p class="text-slate-500 dark:text-slate-400 mt-2 text-sm">Your intelligent healthcare assistant</p>
        </div>
      </div>
      <app-chat-message *ngFor="let msg of messages; trackBy: trackByMessageId" [message]="msg"></app-chat-message>
      <app-typing-indicator *ngIf="isTyping"></app-typing-indicator>
    </div>
  `
})
export class ChatWindowComponent implements AfterViewChecked {
  @Input() messages: Message[] = [];
  @Input() isTyping: boolean = false;
  faStethoscope = faStethoscope;
  
  @ViewChild('scrollContainer') private scrollContainer!: ElementRef;

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  scrollToBottom(): void {
    try {
      this.scrollContainer.nativeElement.scrollTop = this.scrollContainer.nativeElement.scrollHeight;
    } catch(err) { }
  }

  trackByMessageId(index: number, message: Message): string {
    return message.id;
  }
}
