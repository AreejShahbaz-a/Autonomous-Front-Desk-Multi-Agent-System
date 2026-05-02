import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Keyboard } from 'react-native';
import { SendHorizontal, Paperclip, Mic } from 'lucide-react-native';

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
    }
  };

  return (
    <View className="px-4 pb-2">
      <View className="flex-row items-end gap-2 bg-slate-50/50 dark:bg-slate-900/50 border border-slate-200/50 dark:border-slate-800/50 rounded-[24px] px-3 py-2 shadow-sm">
        <TouchableOpacity className="p-2.5 rounded-full active:bg-slate-200 dark:active:bg-slate-800">
          <Paperclip size={20} color="#64748b" />
        </TouchableOpacity>
        
        <TextInput
          className="flex-1 text-[16px] text-slate-800 dark:text-slate-100 max-h-32 px-1 py-2.5"
          placeholder="Type a message..."
          placeholderTextColor="#94a3b8"
          value={text}
          onChangeText={setText}
          multiline
          editable={!isTyping}
          textAlignVertical="center"
        />
        
        {!text.trim() && (
          <TouchableOpacity className="p-2.5 rounded-full active:bg-slate-200 dark:active:bg-slate-800">
            <Mic size={20} color="#64748b" />
          </TouchableOpacity>
        )}

        <TouchableOpacity
          onPress={handleSend}
          disabled={!text.trim() || isTyping}
          className={`w-11 h-11 rounded-full items-center justify-center shadow-lg transition-all ${
            text.trim() && !isTyping 
              ? 'bg-teal-600 dark:bg-teal-500 shadow-teal-500/30' 
              : 'bg-slate-200 dark:bg-slate-800 opacity-50'
          }`}
        >
          <SendHorizontal
            size={22}
            color={text.trim() && !isTyping ? 'white' : '#94a3b8'}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};