import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Message } from '../models/message.model';

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  updatedAt: Date;
}

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private http = inject(HttpClient);
  
  private sessionsSubject: BehaviorSubject<ChatSession[]>;
  public sessions$: Observable<ChatSession[]>;

  private activeSessionIdSubject: BehaviorSubject<string | null>;
  public activeSessionId$: Observable<string | null>;

  private messagesSubject = new BehaviorSubject<Message[]>([]);
  public messages$ = this.messagesSubject.asObservable();

  private isTypingSubject = new BehaviorSubject<boolean>(false);
  public isTyping$ = this.isTypingSubject.asObservable();

  constructor() {
    const initialId = this.generateId();
    const initialSession: ChatSession = { id: initialId, title: 'New Chat', messages: [], updatedAt: new Date() };

    this.sessionsSubject = new BehaviorSubject<ChatSession[]>([initialSession]);
    this.sessions$ = this.sessionsSubject.asObservable();

    this.activeSessionIdSubject = new BehaviorSubject<string | null>(initialId);
    this.activeSessionId$ = this.activeSessionIdSubject.asObservable();

    this.activeSessionId$.subscribe(id => {
      const activeSession = this.sessionsSubject.value.find(s => s.id === id);
      this.messagesSubject.next(activeSession ? activeSession.messages : []);
    });
  }

  createNewSession() {
    const newSession: ChatSession = {
      id: this.generateId(),
      title: 'New Chat',
      messages: [],
      updatedAt: new Date()
    };
    this.sessionsSubject.next([newSession, ...this.sessionsSubject.value]);
    this.setActiveSession(newSession.id);
  }

  setActiveSession(id: string) {
    this.activeSessionIdSubject.next(id);
  }

  private generateId(): string {
    try {
      if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
        // @ts-ignore
        return crypto.randomUUID();
      }
    } catch (e) {}
    return Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 9);
  }

  sendMessage(content: string) {
    const activeId = this.activeSessionIdSubject.value;
    if (!activeId) return;

    const userMsg: Message = { id: Date.now().toString(), role: 'user', content, timestamp: new Date() };
    
    // Update active session messages
    const currentSessions = this.sessionsSubject.value;
    const sessionIndex = currentSessions.findIndex(s => s.id === activeId);
    
    if (sessionIndex > -1) {
      const updatedSession = { ...currentSessions[sessionIndex] };
      updatedSession.messages = [...updatedSession.messages, userMsg];
      
      // Auto-generate title from first message if it's "New Chat"
      if (updatedSession.title === 'New Chat') {
        updatedSession.title = content.substring(0, 30) + (content.length > 30 ? '...' : '');
      }
      
      updatedSession.updatedAt = new Date();
      currentSessions[sessionIndex] = updatedSession;
      this.sessionsSubject.next([...currentSessions]);
      this.messagesSubject.next(updatedSession.messages);
    }

    this.isTypingSubject.next(true);

    this.http.post<Message>('http://127.0.0.1:8000/api/chat', { 
      message: content,
      session_id: activeId
    }).pipe(
      catchError((error) => {
        console.error('API Error', error);
        return [{ id: Date.now().toString(), role: 'agent', content: 'Connection error.', timestamp: new Date() }];
      })
    ).subscribe((responseMsg: any) => {
      this.isTypingSubject.next(false);
      
      const latestSessions = this.sessionsSubject.value;
      const actIdx = latestSessions.findIndex(s => s.id === activeId);
      if (actIdx > -1) {
        const updatedSession = { ...latestSessions[actIdx] };
        updatedSession.messages = [...updatedSession.messages, responseMsg];
        updatedSession.updatedAt = new Date();
        latestSessions[actIdx] = updatedSession;
        this.sessionsSubject.next([...latestSessions]);
        
        // Update messages view if this is still the active session
        if (this.activeSessionIdSubject.value === activeId) {
          this.messagesSubject.next(updatedSession.messages);
        }
      }
    });
  }
}
