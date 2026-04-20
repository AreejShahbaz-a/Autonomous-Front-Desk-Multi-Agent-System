import { Component } from '@angular/core';
import { ChatLayoutComponent } from './components/chat-layout.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [ChatLayoutComponent],
  template: `
    <app-chat-layout></app-chat-layout>
  `,
})
export class AppComponent {}
