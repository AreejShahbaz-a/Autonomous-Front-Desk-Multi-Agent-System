import { useState, useCallback, useRef, useEffect } from 'react';
import { generateSessionId, sendMessageToApi, ChatMessage, ChatSession } from '../services/chatService';

export const useChat = () => {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);

  // Initialize with one session if none exist
  useEffect(() => {
    if (sessions.length === 0) {
      const newId = generateSessionId();
      const initialSession: ChatSession = {
        id: newId,
        title: 'New Chat',
        messages: [],
        updatedAt: new Date(),
      };
      setSessions([initialSession]);
      setActiveSessionId(newId);
    }
  }, []);

  const activeSession = sessions.find((s) => s.id === activeSessionId);
  const messages = activeSession ? activeSession.messages : [];

  const createNewChat = useCallback(() => {
    const newId = generateSessionId();
    const newSession: ChatSession = {
      id: newId,
      title: 'New Chat',
      messages: [],
      updatedAt: new Date(),
    };
    setSessions((prev) => [newSession, ...prev]);
    setActiveSessionId(newId);
  }, []);

  const switchSession = useCallback((id: string) => {
    setActiveSessionId(id);
  }, []);

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || !activeSessionId) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      session_id: activeSessionId,
      message: text,
      isUser: true,
      timestamp: new Date(),
    };

    // Update session messages and title
    setSessions((prev) =>
      prev.map((s) => {
        if (s.id === activeSessionId) {
          let newTitle = s.title;
          if (s.messages.length === 0) {
            newTitle = text.substring(0, 30) + (text.length > 30 ? '...' : '');
          }
          return {
            ...s,
            title: newTitle,
            messages: [...s.messages, userMessage],
            updatedAt: new Date(),
          };
        }
        return s;
      })
    );

    setIsTyping(true);

    try {
      const response = await sendMessageToApi(text, activeSessionId);
      
      const agentMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        session_id: activeSessionId,
        message: response.content || response.response || response.message || "No response received",
        isUser: false,
        timestamp: new Date(),
      };
      
      setSessions((prev) =>
        prev.map((s) => {
          if (s.id === activeSessionId) {
            return {
              ...s,
              messages: [...s.messages, agentMessage],
              updatedAt: new Date(),
            };
          }
          return s;
        })
      );
    } catch (error) {
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        session_id: activeSessionId,
        message: "Sorry, there was a connection error. Please try again.",
        isUser: false,
        timestamp: new Date(),
      };
      setSessions((prev) =>
        prev.map((s) => {
          if (s.id === activeSessionId) {
            return {
              ...s,
              messages: [...s.messages, errorMessage],
              updatedAt: new Date(),
            };
          }
          return s;
        })
      );
    } finally {
      setIsTyping(false);
    }
  }, [activeSessionId]);

  return {
    sessions,
    activeSessionId,
    messages,
    isTyping,
    sendMessage,
    createNewChat,
    switchSession,
  };
};