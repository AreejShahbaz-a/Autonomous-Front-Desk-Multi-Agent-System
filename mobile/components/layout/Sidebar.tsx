import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Animated, Dimensions } from 'react-native';
import { Stethoscope, Plus, MessageSquare, User, LogOut, ChevronLeft } from 'lucide-react-native';
import { ChatSession } from '@/services/chatService';

interface SidebarProps {
  sessions: ChatSession[];
  activeSessionId: string | null;
  onSelectSession: (id: string) => void;
  onCreateNewChat: () => void;
  onClose: () => void;
  isDark: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  sessions,
  activeSessionId,
  onSelectSession,
  onCreateNewChat,
  onClose,
  isDark
}) => {
  return (
    <View className="flex-1 bg-slate-100 dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800 shadow-2xl">
      {/* Sidebar Header */}
      <View className="px-6 py-8 border-b border-slate-200 dark:border-slate-800 flex-row justify-between items-center">
        <View className="flex-row items-center gap-2">
          <View className="w-8 h-8 bg-teal-500 rounded-lg items-center justify-center">
            <Stethoscope size={20} color="white" />
          </View>
          <Text className="text-xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">
            Reception AI
          </Text>
        </View>
        <TouchableOpacity onPress={onClose} className="md:hidden">
          <ChevronLeft size={24} color={isDark ? '#94a3b8' : '#64748b'} />
        </TouchableOpacity>
      </View>

      {/* New Consultation Button */}
      <View className="px-4 py-4">
        <TouchableOpacity 
          onPress={onCreateNewChat}
          className="flex-row items-center gap-3 px-4 py-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm active:opacity-80"
        >
          <View className="w-8 h-8 rounded-full bg-teal-50 dark:bg-teal-900/30 items-center justify-center">
            <Plus size={18} color="#0d9488" />
          </View>
          <Text className="text-teal-600 dark:text-teal-400 font-semibold">
            New Consultation
          </Text>
        </TouchableOpacity>
      </View>

      {/* Session History */}
      <ScrollView className="flex-1 px-3 py-2">
        <Text className="text-xs font-bold text-slate-500 uppercase tracking-widest px-3 mb-4 mt-2">
          Recent History
        </Text>
        
        {sessions.map((session) => (
          <TouchableOpacity
            key={session.id}
            onPress={() => onSelectSession(session.id)}
            className={`flex-row items-center gap-3 px-4 py-3 rounded-xl mb-1 transition-all ${
              session.id === activeSessionId 
                ? 'bg-slate-200 dark:bg-slate-800' 
                : 'hover:bg-slate-100 dark:hover:bg-slate-900'
            }`}
          >
            <MessageSquare 
              size={16} 
              color={session.id === activeSessionId ? '#0d9488' : (isDark ? '#64748b' : '#94a3b8')} 
            />
            <Text 
              numberOfLines={1}
              className={`flex-1 text-sm ${
                session.id === activeSessionId 
                  ? 'text-teal-700 dark:text-teal-300 font-medium' 
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              {session.title}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* User Profile */}
      <View className="p-4 border-t border-slate-200 dark:border-slate-800 mt-auto">
        <View className="flex-row items-center gap-3 px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800">
          <View className="w-10 h-10 rounded-full bg-teal-100 dark:bg-teal-900/50 items-center justify-center border border-teal-200 dark:border-teal-800">
            <Text className="text-teal-700 dark:text-teal-400 font-bold text-xs">DR</Text>
          </View>
          <View className="flex-1">
            <Text className="text-sm font-bold text-slate-800 dark:text-slate-100">Dr. Patient</Text>
            <Text className="text-[10px] text-slate-500 dark:text-slate-400">Chief Medical Officer</Text>
          </View>
          <TouchableOpacity>
            <LogOut size={16} color={isDark ? '#94a3b8' : '#64748b'} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};
