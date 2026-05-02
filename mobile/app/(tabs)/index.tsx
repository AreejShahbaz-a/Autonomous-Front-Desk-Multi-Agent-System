import React, { useRef, useState } from 'react';
import { View, Text, KeyboardAvoidingView, Platform, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { KeyboardAwareFlatList } from 'react-native-keyboard-aware-scroll-view';
import { useChat } from '@/hooks/useChat';
import { ChatMessage } from '@/components/chat/ChatMessage';
import { ChatInput } from '@/components/chat/ChatInput';
import { TypingIndicator } from '@/components/chat/TypingIndicator';
import { Stethoscope, Menu, Sun, Moon, Settings, Zap, UserPlus, Calendar, ClipboardList, Activity } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import { MainLayout } from '@/components/layout/MainLayout';

const SUGGESTED_ACTIONS = [
  { id: '1', text: 'Register patient', icon: UserPlus },
  { id: '2', text: 'Book an appointment', icon: Calendar },
  { id: '3', text: 'Show appointments', icon: ClipboardList },
  { id: '4', text: 'Check symptoms', icon: Activity },
];

export default function ChatScreen() {
  const {
    sessions,
    activeSessionId,
    messages,
    isTyping,
    sendMessage,
    createNewChat,
    switchSession
  } = useChat();

  const flatListRef = useRef<any>(null);
  const { colorScheme, toggleColorScheme } = useColorScheme();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const isDark = colorScheme === 'dark';

  const handleSuggestedAction = (text: string) => {
    sendMessage(text);
  };

  return (
    <MainLayout
      sessions={sessions}
      activeSessionId={activeSessionId}
      onSelectSession={switchSession}
      onCreateNewChat={createNewChat}
      isDark={isDark}
      isOpen={isSidebarOpen}
      setIsOpen={setIsSidebarOpen}
    >
      <SafeAreaView style={{ flex: 1 }} edges={['top']} className="bg-white dark:bg-[#0B1120]">
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
        >
          {/* Header */}
          <View className="px-4 py-3 border-b border-slate-100 dark:border-slate-800/50 bg-white/80 dark:bg-[#0B1120]/80 backdrop-blur-xl flex-row items-center justify-between">
            <View className="flex-row items-center gap-3">
              <TouchableOpacity
                onPress={() => setIsSidebarOpen(true)}
                className="p-2 -ml-2 rounded-xl active:bg-slate-100 dark:active:bg-slate-800"
              >
                <Menu size={22} color={isDark ? '#f1f5f9' : '#1e293b'} />
              </TouchableOpacity>
              <View className="flex-row items-center gap-2">
                <View className="w-8 h-8 rounded-lg bg-teal-50 dark:bg-teal-900/30 items-center justify-center border border-teal-100 dark:border-teal-800/50">
                  <Stethoscope size={18} color="#0d9488" />
                </View>
                <Text className="text-lg font-bold text-slate-800 dark:text-slate-100">
                  Reception
                </Text>
              </View>
            </View>

            <View className="flex-row items-center gap-1">
              <TouchableOpacity
                onPress={toggleColorScheme}
                className="p-2.5 rounded-full active:bg-slate-100 dark:active:bg-slate-800"
              >
                {isDark ? (
                  <Sun size={20} color="#fbbf24" />
                ) : (
                  <Moon size={20} color="#64748b" />
                )}
              </TouchableOpacity>
              <TouchableOpacity className="p-2.5 rounded-full active:bg-slate-100 dark:active:bg-slate-800">
                <Settings size={20} color={isDark ? '#94a3b8' : '#64748b'} />
              </TouchableOpacity>
            </View>
          </View>

          <KeyboardAwareFlatList
            ref={flatListRef as any}
            data={messages}
            keyExtractor={(item) => item.id}
            className="flex-1 px-4"
            contentContainerStyle={{ flexGrow: 1, paddingBottom: 20 }}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
            enableOnAndroid
            extraScrollHeight={16}
            onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
            onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
            ListEmptyComponent={
              <View className="flex-1 items-center justify-center mt-12 px-6">
                <View className="w-20 h-20 bg-teal-50 dark:bg-teal-900/20 rounded-3xl items-center justify-center mb-8 border border-teal-100/50 dark:border-teal-800/30">
                  <Stethoscope size={18} color="#0d9488" />
                </View>
                <Text className="text-3xl font-bold text-slate-900 dark:text-white mb-3 text-center tracking-tight">
                  How can I help you today?
                </Text>
                <Text className="text-slate-500 dark:text-slate-400 text-center text-lg leading-6 mb-10">
                  I'm your intelligent healthcare assistant, ready to help with appointments and more.
                </Text>

                <View className="w-full gap-3">
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ paddingHorizontal: 4, gap: 10 }}
                  >
                    {SUGGESTED_ACTIONS.map((action) => {
                      const Icon = action.icon;
                      return (
                        <TouchableOpacity
                          key={action.id}
                          onPress={() => handleSuggestedAction(action.text)}
                          className="flex-row items-center gap-3 px-5 py-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm active:opacity-80"
                        >
                          <View className="w-8 h-8 rounded-lg bg-teal-50 dark:bg-teal-900/30 items-center justify-center">
                            <Icon size={18} color="#0d9488" />
                          </View>
                          <Text className="text-slate-700 dark:text-slate-200 font-semibold">
                            {action.text}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>
                </View>
              </View>
            }
            renderItem={({ item }) => (
              <ChatMessage message={item.message} isUser={item.isUser} />
            )}
          />

          <View className="bg-white dark:bg-[#0B1120] border-t border-slate-100 dark:border-slate-800/50">
            {isTyping && (
              <View className="px-4 py-2">
                <TypingIndicator />
              </View>
            )}
            <View className="pb-6">
              <ChatInput onSend={sendMessage} isTyping={isTyping} />
              <Text className="text-[10px] text-slate-400 dark:text-slate-500 text-center mt-2 px-4 italic">
                MediCare AI can make mistakes. Always consult a healthcare professional.
              </Text>
            </View>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </MainLayout>
  );
}
