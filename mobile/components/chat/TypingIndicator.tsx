import React, { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import { Bot } from 'lucide-react-native';

const Dot = ({ delay }: { delay: number }) => {
  const translateY = useSharedValue(0);

  useEffect(() => {
    translateY.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(-6, { duration: 300, easing: Easing.inOut(Easing.ease) }),
          withTiming(0, { duration: 300, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      )
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: translateY.value }],
    };
  });

  return (
    <Animated.View
      style={animatedStyle}
      className="w-1.5 h-1.5 rounded-full bg-slate-400 dark:bg-slate-500 mx-1"
    />
  );
};

export const TypingIndicator = () => {
  return (
    <View className="flex-row w-full mb-4 px-4 justify-start items-end">
      <View className="w-8 h-8 rounded-full bg-teal-600 dark:bg-teal-500 items-center justify-center mr-2 shrink-0">
        <Bot size={16} color="white" />
      </View>
      <View className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/50 shadow-sm rounded-2xl rounded-tl-sm px-4 py-4 flex-row items-center h-10">
        <Dot delay={0} />
        <Dot delay={150} />
        <Dot delay={300} />
      </View>
    </View>
  );
};