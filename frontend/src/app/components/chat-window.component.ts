import { Component, Input, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChatMessageComponent } from './chat-message.component';
import { TypingIndicatorComponent } from './typing-indicator.component';
import { Message } from '../models/message.model';

@Component({
  selector: 'app-chat-window',
  standalone: true,
  imports: [CommonModule, ChatMessageComponent, TypingIndicatorComponent],
  template: `
    <div #scrollContainer class="flex-1 overflow-y-auto w-full pb-32">
      <div class="w-full flex justify-center py-8 mb-2">
        <h2 class="text-xl font-semibold text-slate-400">How can I help you today?</h2>
      </div>
      <app-chat-message *ngFor="let msg of messages" [message]="msg"></app-chat-message>
      <app-typing-indicator *ngIf="isTyping"></app-typing-indicator>
    </div>
  `
})
export class ChatWindowComponent implements AfterViewChecked {
  @Input() messages: Message[] = [];
  @Input() isTyping: boolean = false;
  
  @ViewChild('scrollContainer') private scrollContainer!: ElementRef;

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  scrollToBottom(): void {
    try {
      this.scrollContainer.nativeElement.scrollTop = this.scrollContainer.nativeElement.scrollHeight;
    } catch(err) { }
  }
}
