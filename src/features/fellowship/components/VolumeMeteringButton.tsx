import { Icon } from '#/components/ui/icon';
import AnimatedPressable from '@/components/common/animated-pressable';
import { cn } from '@/shared/utils/cn';
import { useSpeechRecognitionEvent } from 'expo-speech-recognition';
import { CircleStop, Mic, Square } from 'lucide-react-native';
import {
  type ButtonProps,
  Image,
  StyleSheet,
  View,
  type ViewProps,
} from 'react-native';
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  Easing,
  withSpring,
  withSequence,
} from 'react-native-reanimated';

const MIN_SCALE = 1;
const MAX_SCALE = 1.2;

/**
 * This is an example component that uses the `volumechange` event to animate the volume metering of a user's voice.
 */
export function VolumeMeteringButton({
  isRecording,
  onPress,
  ...props
}: {
  isRecording: boolean;
  onPress: () => void;
} & ViewProps) {
  const volumeScale = useSharedValue(MIN_SCALE);
  const pulseScale = useSharedValue(MIN_SCALE);
  const pulseOpacity = useSharedValue(0);

  const reset = () => {
    volumeScale.value = MIN_SCALE;
    pulseScale.value = MIN_SCALE;
    pulseOpacity.value = 0;
  };

  useSpeechRecognitionEvent('start', reset);
  useSpeechRecognitionEvent('end', reset);

  useSpeechRecognitionEvent('volumechange', (event) => {
    if (event.value <= 1) {
      return;
    }

    const newScale = interpolate(
      event.value,
      [-2, 20], // The value range is between -2 and 12
      [MIN_SCALE, MAX_SCALE],
      Extrapolation.CLAMP,
    );

    // Animate the volume scaling
    volumeScale.value = withSequence(
      withSpring(newScale, {
        damping: 10,
        stiffness: 150,
      }),
      // Scale back down, unless the volume changes again
      withTiming(MIN_SCALE, { duration: 500 }),
    );

    // Animate the pulse (scale and fade out)
    if (pulseOpacity.value <= 0) {
      pulseScale.value = MIN_SCALE;
      pulseOpacity.value = 1;
      pulseScale.value = withTiming(MAX_SCALE, {
        duration: 1000,
        easing: Easing.out(Easing.quad),
      });
      pulseOpacity.value = withTiming(0, { duration: 1000 });
    }
  });

  const volumeScaleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: volumeScale.value }],
  }));

  const pulseStyle = useAnimatedStyle(() => ({
    // opacity: pulseOpacity.value,
    opacity: 1,
    transform: [{ scale: pulseScale.value }],
  }));

  return (
    <AnimatedPressable onPress={onPress} {...props} withHaptic>
      <View className="w-9 h-9 items-center justify-center">
        <View style={styles.absoluteCenteredContainer}>
          <Animated.View
            className="rounded-full w-9 h-9"
            style={volumeScaleStyle}
          />
        </View>

        {isRecording && <View style={styles.absoluteCenteredContainer}>
          <Animated.View
            className="rounded-full bg-primary-500 w-9 h-9"
          // style={pulseStyle}
          />
        </View>}

        {isRecording && <View style={styles.absoluteCenteredContainer}>
          <Animated.View
            className="rounded-full border border-primary-500/40 w-9 h-9"
            style={pulseStyle}
          />
        </View>}
        <View className="justify-center items-center">
          <Icon as={isRecording ? Square : Mic} size={isRecording ? "sm" : "lg"} fill={isRecording ? "white" : ""} className={cn(isRecording ? "text-white" : "text-typography-600")} />
        </View>
      </View>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  absoluteCenteredContainer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
