import React, { useState, useEffect, useRef, type ReactNode } from 'react';
import {
  View,
  Text,
  Pressable,
  Modal,
  Dimensions,
  TouchableWithoutFeedback,
  type LayoutChangeEvent,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { cn } from '@/shared/utils/cn';

type Placement = 'top' | 'bottom' | 'left' | 'right' | 'bottom left' | 'bottom right' | 'top left' | 'top right';
type TextSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

interface PopupMenuProps {
  children: ReactNode;
  trigger: (props: { onPress: () => void }) => ReactNode;
  isOpen?: boolean;
  onOpen?: () => void;
  onClose?: () => void;
  placement?: Placement;
  offset?: number;
  className?: string;
  hasBackdrop?: boolean;
}

interface PopupMenuItemProps {
  children: ReactNode;
  onPress?: () => void;
  closeOnSelect?: boolean;
  disabled?: boolean;
  className?: string;
}

interface PopupMenuItemLabelProps {
  children: ReactNode;
  className?: string;
  size?: TextSize;
  bold?: boolean;
  disabled?: boolean;
}

const PopupMenu: React.FC<PopupMenuProps> = ({
  children,
  trigger,
  isOpen: isOpenProp,
  onOpen,
  onClose,
  placement = 'bottom',
  offset = 8,
  className,
  hasBackdrop = true,
}) => {
  const [isOpen, setIsOpen] = useState(isOpenProp || false);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0, width: 0, height: 0 });
  const [menuLayout, setMenuLayout] = useState({ width: 0, height: 0 });
  const triggerRef = useRef<View>(null);
  const menuRef = useRef<Animated.View>(null);

  // Reanimated 애니메이션을 위한 값들
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.9);
  const translateY = useSharedValue(10);

  const menuStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      { scale: scale.value },
      { translateY: translateY.value }
    ],
  }))

  useEffect(() => {
    if (isOpenProp !== undefined) {
      setIsOpen(isOpenProp);
    }
  }, [isOpenProp]);

  useEffect(() => {
    if (isOpen) {
      // 메뉴가 열릴 때 애니메이션
      measureTriggerPosition();
      opacity.value = withTiming(1, { duration: 150 });
      scale.value = withSpring(1, {
        damping: 15,
        stiffness: 150,
        mass: 0.6,
      });
      translateY.value = withSpring(0, {
        damping: 15,
        stiffness: 150,
      });
      onOpen?.();
    } else {
      // 메뉴가 닫힐 때 애니메이션
      opacity.value = withTiming(0, { duration: 100 });
      scale.value = withTiming(0.9, { duration: 100 });
      translateY.value = withTiming(10, { duration: 100 });
    }
  }, [isOpen, opacity, scale, translateY, onOpen]);

  const measureTriggerPosition = () => {
    if (triggerRef.current) {
      triggerRef.current.measureInWindow((x, y, width, height) => {
        const windowWidth = Dimensions.get('window').width;
        const windowHeight = Dimensions.get('window').height;

        // 트리거 위치 정보 저장
        const triggerPosition = { x, y, width, height };

        // 메뉴 크기 추정 (실제 크기는 렌더링 후에만 알 수 있지만, 일반적인 값으로 초기 배치)
        // menuLayout이 이미 측정되었다면 그 값을 사용, 아니면 기본값 사용
        const estimatedMenuWidth = menuLayout.width > 0 ? menuLayout.width : 200;
        const estimatedMenuHeight = menuLayout.height > 0 ? menuLayout.height : 150;

        // placement에 따라 위치 계산
        let top = y;
        let left = x;

        if (placement.includes('top')) {
          top = y - estimatedMenuHeight - offset;
        } else if (placement.includes('bottom')) {
          top = y + height + offset;
        }

        if (placement.includes('left')) {
          left = x;
        } else if (placement.includes('right')) {
          left = x + width - estimatedMenuWidth;
        }

        // 화면 경계 체크 및 조정
        if (left + estimatedMenuWidth > windowWidth) {
          left = windowWidth - estimatedMenuWidth - 10;
        }
        if (left < 10) {
          left = 10;
        }
        if (top + estimatedMenuHeight > windowHeight) {
          // 아래에 공간이 없으면 위에 표시
          top = y - estimatedMenuHeight - offset;
        }
        if (top < 10) {
          // 위에도 공간이 없으면 최소 여백 유지
          top = 10;
        }

        setMenuPosition({ top, left, width: triggerPosition.width, height: triggerPosition.height });
      });
    }
  };

  const handleToggle = () => {
    // 햅틱 피드백 추가
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsOpen(prev => !prev);
  };

  const handleClose = () => {
    setIsOpen(false);
    onClose?.();
  };

  const handleMenuLayout = (event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    setMenuLayout({ width, height });

    // 메뉴 크기가 변경되면 위치 재조정
    if (isOpen) {
      measureTriggerPosition();
    }
  };

  const renderChildren = () => {
    return React.Children.map(children, child => {
      if (React.isValidElement(child)) {
        return React.cloneElement(child as React.ReactElement<PopupMenuItemProps>, {
          onPress: () => {
            const childProps = child.props as PopupMenuItemProps;
            childProps.onPress?.();
            if (childProps.closeOnSelect !== false) {
              handleClose();
            }
          },
        });
      }
      return child;
    });
  };

  return (
    <View>
      <View ref={triggerRef}>
        {trigger({ onPress: handleToggle })}
      </View>

      <Modal
        visible={isOpen}
        transparent
        animationType="none"
        onRequestClose={handleClose}
      >
        <TouchableWithoutFeedback onPress={handleClose}>
          <View className={cn("absolute top-0 bottom-0 left-0 right-0", {
            "bg-background-900/50": hasBackdrop
          })}>
            <Animated.View
              ref={menuRef}
              onLayout={handleMenuLayout}
              className={cn(
                "absolute rounded-md bg-background-0 border border-outline-100 p-1 shadow-hard-5 overflow-hidden",
                className
              )}
              style={[
                {
                  top: menuPosition.top,
                  left: menuPosition.left,
                  minWidth: 200,
                  maxWidth: Dimensions.get('window').width - 20,
                },
                menuStyle
              ]}
            >
              <TouchableWithoutFeedback>
                <View>{renderChildren()}</View>
              </TouchableWithoutFeedback>
            </Animated.View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
};

const PopupMenuItem: React.FC<PopupMenuItemProps> = ({
  children,
  onPress,
  disabled = false,
  className,
}) => {
  const handlePress = () => {
    if (disabled) return;

    // 메뉴 아이템 클릭 시 햅틱 피드백 추가
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress?.();
  };

  return (
    <Pressable
      onPress={handlePress}
      className={cn(
        "p-3 flex-row items-center rounded",
        "active:bg-background-100 hover:bg-background-50",
        disabled && "opacity-40",
        className
      )}
      disabled={disabled}
    >
      {children}
    </Pressable>
  );
};

const PopupMenuItemLabel: React.FC<PopupMenuItemLabelProps> = ({
  children,
  className,
  size = 'md',
  bold = false,
  disabled
}) => {
  const sizeClasses = {
    xs: 'text-xs',
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl',
    '2xl': 'text-2xl',
  };

  return (
    <Text
      className={cn(
        "text-typography-700 font-normal font-body",
        sizeClasses[size],
        bold && "font-bold",
        disabled && "opacity-70",
        className
      )}
    >
      {children}
    </Text>
  );
};

export { PopupMenu, PopupMenuItem, PopupMenuItemLabel };