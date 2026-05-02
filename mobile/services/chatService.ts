import axios from 'axios';
import uuid from 'react-native-uuid';

// Use your backend host ip for emulator connecting to local server
const API_URL = 'http://192.168.100.3:8000/api/chat';

export interface ChatMessage {
  id: string;
  session_id: string;
  message: string;
  isUser: boolean;
  timestamp: Date;
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
