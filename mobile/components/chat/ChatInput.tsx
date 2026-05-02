import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Keyboard } from 'react-native';
import { SendHorizontal } from 'lucide-react-native';

interface ChatInputProps {
  onSend: (message: string) => void;
  isTyping: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({ onSend, isTyping }) => {
  const [text, setText] = useState('');

  const handleSend = () => {
    if (text.trim() && !isTyping) {
      onSend(text);
      setText('');
      // Optional: hide keyboard
      // Keyboard.dismiss();
    }
  };

  return (
    <View 
      className="px-4 pt-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#0B1120]"
      style={{ paddingBottom: 8 }}
    >
      <View className="flex-row items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/50 rounded-2xl px-4 py-2 shadow-sm">
        <TextInput
          className="flex-1 text-base text-slate-800 dark:text-slate-100 max-h-32 pt-2 pb-2"
          placeholder="Type your message..."
          placeholderTextColor="#94a3b8" // slate-400
          value={text}
          onChangeText={setText}
          multiline
          editable={!isTyping}
        />
        <TouchableOpacity
          onPress={handleSend}
          disabled={!text.trim() || isTyping}
          className={`ml-2 w-10 h-10 rounded-full items-center justify-center ${
            text.trim() && !isTyping ? 'bg-teal-600 dark:bg-teal-500' : 'bg-slate-100 dark:bg-slate-800'
          }`}
        >
          <SendHorizontal
            size={20}
            color={text.trim() && !isTyping ? 'white' : '#94a3b8'}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};