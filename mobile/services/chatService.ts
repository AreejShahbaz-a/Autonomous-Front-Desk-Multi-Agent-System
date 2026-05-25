import axios from 'axios';
import uuid from 'react-native-uuid';
import Constants from 'expo-constants';

const getApiUrl = () => {
  if (process.env.EXPO_PUBLIC_API_URL && !process.env.EXPO_PUBLIC_API_URL.includes('10.0.2.2')) {
    return `${process.env.EXPO_PUBLIC_API_URL}/api/chat`;
  }

  return 'http://192.168.100.198:8000/api/chat';
};

const API_URL = getApiUrl();

export interface ChatMessage {
  id: string;
  session_id: string;
  message: string;
  isUser: boolean;
  timestamp: Date;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  updatedAt: Date;
}

export const generateSessionId = () => {
  return uuid.v4().toString();
};

export const sendMessageToApi = async (message: string, sessionId: string) => {
  try {
    const response = await axios.post(API_URL, {
      message,
      session_id: sessionId,
    });
    return response.data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};
