import React, { useState, useRef, useEffect } from 'react';
import { View, Animated, TouchableOpacity, Modal, Dimensions, PanResponder } from 'react-native';
import { Sidebar } from './Sidebar';
import { ChatSession } from '@/services/chatService';

const { width } = Dimensions.get('window');
const SIDEBAR_WIDTH = width * 0.8;

interface MainLayoutProps {
  children: React.ReactNode;
  sessions: ChatSession[];
  activeSessionId: string | null;
  onSelectSession: (id: string) => void;
  onCreateNewChat: () => void;
  isDark: boolean;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export const MainLayout: React.FC<MainLayoutProps> = ({
  children,
  sessions,
  activeSessionId,
  onSelectSession,
  onCreateNewChat,
  isDark,
  isOpen,
  setIsOpen
}) => {
  const slideAnim = useRef(new Animated.Value(-SIDEBAR_WIDTH)).current;

  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: isOpen ? 0 : -SIDEBAR_WIDTH,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [isOpen]);

  const closeSidebar = () => setIsOpen(false);

  return (
    <View className="flex-1">
      {/* Main Content */}
      <View className="flex-1 bg-white dark:bg-[#0B1120]">
        {children}
      </View>

      {/* Sidebar Backdrop */}
      {isOpen && (
        <TouchableOpacity
          activeOpacity={1}
          onPress={closeSidebar}
          className="absolute inset-0 bg-black/50 z-40"
          style={{ opacity: isOpen ? 1 : 0 }}
        />
      )}

      {/* Sidebar Container */}
      <Animated.View
        className="absolute top-0 bottom-0 left-0 z-50"
        style={{
          width: SIDEBAR_WIDTH,
          transform: [{ translateX: slideAnim }],
        }}
      >
        <Sidebar
          sessions={sessions}
          activeSessionId={activeSessionId}
          onSelectSession={(id) => {
            onSelectSession(id);
            closeSidebar();
          }}
          onCreateNewChat={() => {
            onCreateNewChat();
            closeSidebar();
          }}
          onClose={closeSidebar}
          isDark={isDark}
        />
      </Animated.View>
    </View>
  );
};
