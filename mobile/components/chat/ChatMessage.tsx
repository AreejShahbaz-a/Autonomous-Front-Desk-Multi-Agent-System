import React from 'react';
import { View, Text } from 'react-native';
import { Bot, User } from 'lucide-react-native';
import Markdown, { MarkdownIt } from 'react-native-markdown-display';
import { useColorScheme } from 'nativewind';

interface ChatMessageProps {
  message: string;
  isUser: boolean;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message, isUser }) => {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <View className={`flex-row w-full mb-4 px-4 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && (
        <View className="w-8 h-8 rounded-full bg-teal-600 dark:bg-teal-500 items-center justify-center mr-2 shrink-0">
          <Bot size={16} color="white" />
        </View>
      )}
      
      <View
        className={`max-w-[80%] rounded-2xl px-4 py-3 ${
          isUser
            ? 'bg-teal-600 dark:bg-teal-500 rounded-tr-sm'
            : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/50 shadow-sm rounded-tl-sm'
        }`}
      >
        {isUser ? (
          <Text className="text-white text-base leading-6">{message}</Text>
        ) : (
          <Markdown
            style={{
              body: {
                color: isDark ? '#f8fafc' : '#1e293b',
                fontSize: 16,
                lineHeight: 24,
              },
              code_block: {
                backgroundColor: isDark ? '#0f172a' : '#f1f5f9',
                color: isDark ? '#38bdf8' : '#0284c7',
                borderRadius: 4,
                padding: 8,
              },
              code_inline: {
                backgroundColor: isDark ? '#0f172a' : '#f1f5f9',
                color: isDark ? '#38bdf8' : '#0284c7',
              },
              link: {
                color: '#0d9488',
              },
            }}
          >
            {message}
          </Markdown>
        )}
      </View>
    </View>
  );
};