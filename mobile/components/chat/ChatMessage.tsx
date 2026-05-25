import React from 'react';
import { View, Text } from 'react-native';
import { Bot, User } from 'lucide-react-native';
import Markdown from 'react-native-markdown-display';
import { useColorScheme } from 'nativewind';

interface ChatMessageProps {
  message: string;
  isUser: boolean;
  timestamp?: Date;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message, isUser, timestamp = new Date() }) => {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <View className={`flex-row w-full mb-6 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && (
        <View className="w-8 h-8 rounded-xl bg-teal-500 items-center justify-center mr-3 mt-1 shadow-sm">
          <Bot size={18} color="white" />
        </View>
      )}
      
      <View className={`max-w-[85%] ${isUser ? 'items-end' : 'items-start'}`}>
        <View
          className={`rounded-2xl px-4 py-3 shadow-sm ${
            isUser
              ? 'bg-teal-600 dark:bg-teal-500 rounded-tr-none'
              : 'bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/30 rounded-tl-none'
          }`}
        >
          {isUser ? (
            <Text className="text-white text-base leading-6 font-medium">{message}</Text>
          ) : (
            <Markdown
              style={{
                body: {
                  color: isDark ? '#f1f5f9' : '#0f172a',
                  fontSize: 16,
                  lineHeight: 24,
                },
                code_block: {
                  backgroundColor: isDark ? '#020617' : '#f8fafc',
                  color: isDark ? '#2dd4bf' : '#0d9488',
                  borderRadius: 12,
                  padding: 12,
                  marginTop: 8,
                  marginBottom: 8,
                },
                code_inline: {
                  backgroundColor: isDark ? '#020617' : '#f8fafc',
                  color: isDark ? '#2dd4bf' : '#0d9488',
                  paddingHorizontal: 4,
                  borderRadius: 4,
                },
                link: {
                  color: '#0d9488',
                  textDecorationLine: 'underline',
                },
                strong: {
                  fontWeight: 'bold',
                },
                em: {
                  fontStyle: 'italic',
                },
              }}
            >
              {message}
            </Markdown>
          )}
        </View>
        <Text className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 px-1">
          {timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </View>

      {isUser && (
        <View className="w-8 h-8 rounded-xl bg-slate-200 dark:bg-slate-700 items-center justify-center ml-3 mt-1 shadow-sm">
          <User size={18} color={isDark ? '#e2e8f0' : '#475569'} />
        </View>
      )}
    </View>
  );
};