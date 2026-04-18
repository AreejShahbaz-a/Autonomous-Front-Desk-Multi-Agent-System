import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Message } from '../models/message.model';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private http = inject(HttpClient);
  
  private messagesSubject = new BehaviorSubject<Message[]>([]);
  public messages$ = this.messagesSubject.asObservable();

  private isTypingSubject = new BehaviorSubject<boolean>(false);
  public isTyping$ = this.isTypingSubject.asObservable();

  sendMessage(content: string) {
    const userMsg: Message = { id: Date.now().toString(), role: 'user', content, timestamp: new Date() };
    this.messagesSubject.next([...this.messagesSubject.value, userMsg]);
    this.isTypingSubject.next(true);

    this.http.post<Message>('/api/chat', { message: content }).pipe(
      catchError((error) => {
        console.error('API Error', error);
        return [{ id: Date.now().toString(), role: 'agent', content: 'Connection error.', timestamp: new Date() }];
      })
    ).subscribe((responseMsg: any) => {
      this.isTypingSubject.next(false);
      this.messagesSubject.next([...this.messagesSubject.value, responseMsg]);
    });
  }
}
