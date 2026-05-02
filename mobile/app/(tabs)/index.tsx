import React, { useRef } from 'react';
import { View, Text, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { KeyboardAwareFlatList } from 'react-native-keyboard-aware-scroll-view';
import { useChat } from '@/hooks/useChat';
import { ChatMessage } from '@/components/chat/ChatMessage';
import { ChatInput } from '@/components/chat/ChatInput';
import { TypingIndicator } from '@/components/chat/TypingIndicator';
import { Stethoscope } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';

export default function ChatScreen() {
  const { messages, isTyping, sendMessage } = useChat();
  const flatListRef = useRef<any>(null);
  const { colorScheme } = useColorScheme();

  const isDark = colorScheme === 'dark';

  return (
    <SafeAreaView style={{ flex: 1 }} className="bg-slate-50 dark:bg-[#0B1120]">
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        <View className="flex-1 bg-slate-50 dark:bg-[#0B1120]">
          <View className="px-4 py-3 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm flex-row items-center justify-center">
            <Stethoscope size={24} color={isDark ? '#2dd4bf' : '#0d9488'} className="mr-2" />
            <Text className="text-lg font-semibold text-slate-800 dark:text-slate-100">
              Medicare Assistant
            </Text>
          </View>

          <KeyboardAwareFlatList
            ref={flatListRef as any}
            data={messages}
            keyExtractor={(item) => item.id}
            className="flex-1 px-2 pt-4"
            contentContainerStyle={{ flexGrow: 1, paddingBottom: 16 }}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
            enableOnAndroid
            extraScrollHeight={16}
            onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
            onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
            ListEmptyComponent={
              <View className="flex-1 items-center justify-center mt-20 px-4">
                <View className="w-16 h-16 bg-teal-100 dark:bg-teal-900/30 rounded-full items-center justify-center mb-6">
                  <Stethoscope size={32} color={isDark ? '#2dd4bf' : '#0d9488'} />
                </View>
                <Text className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2 text-center">
                  How can I help you today?
                </Text>
                <Text className="text-slate-500 dark:text-slate-400 text-center max-w-sm">
                  I can assist you with booking appointments, checking symptoms, or general medical information.
                </Text>
              </View>
            }
            renderItem={({ item }) => (
              <ChatMessage message={item.message} isUser={item.isUser} />
            )}
          />

          <View className="pt-3">
            {isTyping ? <TypingIndicator /> : null}
            <ChatInput onSend={sendMessage} isTyping={isTyping} />
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
