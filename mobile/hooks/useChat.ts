import { useState, useCallback, useRef } from 'react';
import { generateSessionId, sendMessageToApi, ChatMessage } from '../services/chatService';

export const useChat = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const sessionIdRef = useRef<string>(generateSessionId());

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      session_id: sessionIdRef.current,
      message: text,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsTyping(true);

    try {
      const response = await sendMessageToApi(text, sessionIdRef.current);
      
      const agentMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        session_id: sessionIdRef.current,
        message: response.content || response.response || response.message || "No response received",
        isUser: false,
        timestamp: new Date(),
      };
      
      setMessages((prev) => [...prev, agentMessage]);
    } catch (error) {
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        session_id: sessionIdRef.current,
        message: "Sorry, there was a connection error. Please try again.",
        isUser: false,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  }, []);

  return {
    messages,
    isTyping,
    sendMessage,
    sessionId: sessionIdRef.current,
  };
};