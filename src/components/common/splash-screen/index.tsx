import React, { useEffect, useCallback } from 'react';
import { StyleSheet, View, useWindowDimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  Easing,
  runOnJS,
} from 'react-native-reanimated';
import { Image } from 'expo-image';
import { Text } from '@/shared/components/text';
import { VStack } from '#/components/ui/vstack';

interface AnimatedSplashScreenProps {
  onAnimationComplete: () => void;
}

export function AnimatedSplashScreen({ onAnimationComplete }: AnimatedSplashScreenProps) {
  // Animation values
  const logoOpacity = useSharedValue(0);
  const logoScale = useSharedValue(0.8);
  const titleOpacity = useSharedValue(0);
  const subtitleOpacity = useSharedValue(0);
  const containerOpacity = useSharedValue(1);
  const logoPosition = useSharedValue(0); // 0 = 중앙, -1 = 위로 이동

  const titleAnimatedStyle = useAnimatedStyle(() => ({
    opacity: titleOpacity.value,
  }));

  const subtitleAnimatedStyle = useAnimatedStyle(() => ({
    opacity: subtitleOpacity.value,
  }));

  const containerAnimatedStyle = useAnimatedStyle(() => ({
    opacity: containerOpacity.value,
  }));

  const { height } = useWindowDimensions();

  // 로고 위치 애니메이션 스타일
  const logoAnimatedStyle = useAnimatedStyle(() => {
    // 위로 이동하는 거리 (화면 높이의 10%)
    const translateY = logoPosition.value * (height * 0.1);

    return {
      transform: [{ translateY }],
    };
  });

  // Handle animation completion
  const handleAnimationComplete = useCallback(() => {
    onAnimationComplete();
  }, [onAnimationComplete]);

  // Start animations when component mounts
  useEffect(() => {
    // 애니메이션 시퀀스: 로고 중앙 위치 -> 타이틀 페이드 인 (로고 위로 이동) -> 서브타이틀 페이드 인 -> 홀드 -> 페이드 아웃
    const animationSequence = () => {
      // 로고 애니메이션
      logoOpacity.value = withTiming(1, { duration: 800, easing: Easing.out(Easing.cubic) });
      logoScale.value = withTiming(1, { duration: 800, easing: Easing.out(Easing.cubic) });

      // 타이틀 페이드 인 (800ms 후 시작, 700ms 동안)
      titleOpacity.value = withDelay(
        800,
        withTiming(1, { duration: 700, easing: Easing.out(Easing.ease) })
      );

      // 타이틀이 나타날 때 로고를 위로 이동 (800ms 후 시작, 500ms 동안)
      logoPosition.value = withDelay(
        800,
        withTiming(-1, { duration: 500, easing: Easing.out(Easing.ease) })
      );

      // 서브타이틀 페이드 인 (1300ms 후 시작, 700ms 동안)
      subtitleOpacity.value = withDelay(
        1300,
        withTiming(1, { duration: 700, easing: Easing.out(Easing.ease) })
      );

      // 전체 컨테이너 페이드 아웃 (3000ms 후 시작, 800ms 동안)
      containerOpacity.value = withDelay(3000, withTiming(0, { duration: 800 }, () => {
        // 애니메이션이 완료되면 콜백 실행
        runOnJS(handleAnimationComplete)();
      }));
    };

    // 애니메이션 시작
    animationSequence();
  }, [logoOpacity, logoScale, titleOpacity, subtitleOpacity, containerOpacity, logoPosition, handleAnimationComplete]);

  return (
    <Animated.View style={[styles.container, containerAnimatedStyle]}>
      <View style={styles.centerContainer}>
        {/* 로고 컨테이너 - 애니메이션으로 위치 이동 */}
        <Animated.View style={[styles.logoContainer, logoAnimatedStyle]}>
          <Image
            source={require('../../../../assets/images/icons/manna_icon_beige.png')}
            style={styles.logo}
            contentFit="contain"
          />
        </Animated.View>

        {/* 텍스트 컨테이너 - 처음에는 투명하다가 나타남 */}
        <VStack space="sm" className="items-center mt-10">
          <Animated.View style={titleAnimatedStyle}>
            <Text size="3xl" weight="bold" className="text-primary-700">
              만나
            </Text>
          </Animated.View>

          <Animated.View style={subtitleAnimatedStyle}>
            <Text size="lg" weight="medium" className="text-typography-500">
              크리스천 공동체의 소통과 묵상 공간
            </Text>
          </Animated.View>
        </VStack>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FEF8EF',
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 200,
    height: 200,
  },
});
