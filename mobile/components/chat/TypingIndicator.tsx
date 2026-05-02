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
  const opacity = useSharedValue(0.5);

  useEffect(() => {
    translateY.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(-4, { duration: 400, easing: Easing.bezier(0.4, 0, 0.2, 1) }),
          withTiming(0, { duration: 400, easing: Easing.bezier(0.4, 0, 0.2, 1) })
        ),
        -1,
        false
      )
    );
    opacity.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(1, { duration: 400 }),
          withTiming(0.5, { duration: 400 })
        ),
        -1,
        false
      )
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: translateY.value }],
      opacity: opacity.value,
    };
  });

  return (
    <Animated.View
      style={animatedStyle}
      className="w-1.5 h-1.5 rounded-full bg-teal-500 mx-0.5"
    />
  );
};

export const TypingIndicator = () => {
  return (
    <View className="flex-row w-full mb-4 px-4 justify-start items-start">
      <View className="w-8 h-8 rounded-xl bg-teal-500 items-center justify-center mr-3 mt-1 shadow-sm">
        <Bot size={18} color="white" />
      </View>
      <View className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/30 shadow-sm rounded-2xl rounded-tl-none px-4 py-3 flex-row items-center h-10">
        <Dot delay={0} />
        <Dot delay={200} />
        <Dot delay={400} />
      </View>
    </View>
  );
};