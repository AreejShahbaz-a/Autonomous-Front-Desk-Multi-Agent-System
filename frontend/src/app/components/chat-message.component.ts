import { Component, Input, HostBinding, OnChanges, SimpleChanges, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { trigger, style, animate, transition } from '@angular/animations';
import { Message } from '../models/message.model';
import { marked } from 'marked';

@Component({
  selector: 'app-chat-message',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex w-full justify-center py-4" [ngClass]="isUser ? 'bg-white dark:bg-[#0B1120]' : 'bg-slate-50/90 dark:bg-slate-900 border-y border-slate-100 dark:border-slate-800/50'">
      <div class="flex w-full max-w-3xl gap-4 px-4 m-auto">
        <div class="shrink-0 w-8 h-8 rounded-xl flex items-center justify-center font-bold text-white text-[10px] mt-0.5 shadow-sm border"
             [ngClass]="isUser ? 'bg-slate-800 dark:bg-slate-700 border-slate-700 dark:border-slate-600' : 'bg-teal-600 dark:bg-teal-500 border-teal-500 dark:border-teal-400'">
          {{ isUser ? 'U' : 'AI' }}
        </div>

        <div class="flex-1 min-w-0 rounded-2xl border px-4 py-3 shadow-sm"
             [ngClass]="isUser ? 'bg-slate-800 text-white border-slate-700/80 dark:bg-slate-700 dark:border-slate-600' : 'bg-white text-slate-800 border-slate-200/80 dark:bg-slate-800/95 dark:text-slate-100 dark:border-slate-700'">
          <div class="text-xs font-semibold uppercase tracking-[0.18em] mb-2 opacity-70" *ngIf="!isUser">
            MediCare AI
          </div>
          <div class="text-sm sm:text-base leading-7 font-medium break-words [&_p]:mb-3 [&_p:last-child]:mb-0 [&_strong]:font-semibold [&_em]:italic [&_ul]:list-disc [&_ul]:ml-5 [&_ol]:list-decimal [&_ol]:ml-5 [&_li]:mb-1 [&_h1]:text-lg [&_h2]:text-base [&_h3]:text-sm [&_h1]:font-bold [&_h2]:font-bold [&_h3]:font-bold [&_blockquote]:border-l-4 [&_blockquote]:border-teal-400 [&_blockquote]:pl-3 [&_blockquote]:italic [&_code]:rounded [&_code]:bg-slate-100 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:font-mono dark:[&_code]:bg-slate-900/60"
               [innerHTML]="parsedContent">
          </div>
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
export class ChatMessageComponent implements OnChanges {
  @Input({ required: true }) message!: Message;
  @HostBinding('@slideInUp') animation = true;

  parsedContent: SafeHtml = '';
  private readonly markdownOptions = { breaks: true, gfm: true };

  constructor(private sanitizer: DomSanitizer) {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes['message']) {
      if (this.isUser) {
        const escaped = this.escapeHtml(this.message.content).replace(/\n/g, '<br/>');
        this.parsedContent = this.sanitizer.bypassSecurityTrustHtml(escaped);
      } else {
        const rawHtml = marked.parse(this.message.content, this.markdownOptions) as string;
        this.parsedContent = this.sanitizer.bypassSecurityTrustHtml(rawHtml);
      }
    }
  }

  get isUser(): boolean {
    return this.message.role === 'user';
  }

  private escapeHtml(content: string): string {
    return content
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
}
