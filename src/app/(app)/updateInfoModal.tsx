import { useCallback, useEffect, useRef, useState } from 'react';
import { Image } from 'expo-image';
import { VStack } from '#/components/ui/vstack';
import { Text } from '#/components/ui/text';
import { Heading } from '@/shared/components/heading';
import { Button, ButtonIcon, ButtonText } from '@/components/common/button';
import { HStack } from '#/components/ui/hstack';
import { Icon } from '#/components/ui/icon';
import { useAppUpdateStore } from '@/store/app/app-update';
import { fetchLatestUpdateNote } from '@/api/app_config';
import { getCurrentAppVersion } from '@/shared/utils/app_version';
import {
  ActivityIndicator,
  Animated,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  Pressable,
  View,
} from 'react-native';
import type { AppUpdate } from '@/api/app_config/types';
import { CheckCircle, ChevronDown, X } from 'lucide-react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { isAndroid } from '@/shared/utils/platform';

export default function UpdateInfoModal() {
  const insets = useSafeAreaInsets();

  const [updateInfo, setUpdateInfo] = useState<AppUpdate | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasScrolled, setHasScrolled] = useState(false);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  // const [isImageOpen, setIsImageOpen] = useState(false);
  // const [selectedImageUrl, setSelectedImageUrl] = useState('');

  const { shouldShowUpdateSheet, setLastShownVersion } = useAppUpdateStore();

  const loadUpdateInfo = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await fetchLatestUpdateNote();
      setUpdateInfo(data);
    } catch (error) {
      console.error('Failed to load update info:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (shouldShowUpdateSheet) {
      loadUpdateInfo();
    }
  }, [shouldShowUpdateSheet, loadUpdateInfo]);

  const handleClose = () => {
    router.back();
  };

  const handleConfirm = useCallback(async () => {
    const currentVersion = getCurrentAppVersion();
    await setLastShownVersion(currentVersion);
    router.back();
  }, [setLastShownVersion]);

  const handleScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const offsetY = event.nativeEvent.contentOffset.y;
      if (offsetY > 10 && !hasScrolled) {
        setHasScrolled(true);
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start();
      }
    },
    [hasScrolled, fadeAnim],
  );

  // const handleImagePress = useCallback((imageUrl: string) => {
  //   setIsImageOpen(true);
  //   setSelectedImageUrl(imageUrl);
  // }, []);

  return (
    <VStack className="flex-1 bg-background p-4">
      <VStack space="lg" className="flex-1 px-2 pt-6 pb-4">
        <HStack className="w-full items-center justify-between" style={{ paddingTop: isAndroid ? insets.top : 0 }}>
          <Heading size="xl">
            버전 {updateInfo?.version || getCurrentAppVersion()} 업데이트 내역
          </Heading>
          <Button variant="icon" onPress={handleClose} animation={true}>
            <ButtonIcon as={X} />
          </Button>
        </HStack>

        {isLoading ? (
          <ActivityIndicator className="py-8" />
        ) : (
          <>
            <ScrollView
              onScroll={handleScroll}
              scrollEventThrottle={16}
              showsVerticalScrollIndicator={false}
            >
              {updateInfo?.notes?.map((note) => (
                <VStack key={note.title} space="lg" className="pb-8">
                  <VStack space="xs">
                    <HStack space="sm" className="items-center">
                      <Icon as={CheckCircle} size="xs" />
                      <Text size="xl" className="font-pretendard-semi-bold">
                        {note.title}
                      </Text>
                    </HStack>
                    <Text size="lg" className="text-typography-600">
                      {note.description}
                    </Text>
                  </VStack>
                  {note?.imageUrls?.length && (
                    <ScrollView horizontal>
                      <HStack space="md" className="px-2">
                        {note.imageUrls.map((imageUrl) => (
                          <Pressable
                            key={imageUrl}
                            // onPress={() => handleImagePress(note.imageUrl!)}
                            className="overflow-hidden"
                          >
                            <Image
                              source={{ uri: imageUrl }}
                              alt={note.title}
                              style={{
                                width: 200,
                                height: 400,
                                borderRadius: 14,
                                borderWidth: 1,
                                borderColor: 'lightgray',
                              }}
                              contentFit="cover"
                            />
                          </Pressable>
                        ))}
                      </HStack>
                    </ScrollView>
                  )}
                </VStack>
              ))}

              {(!updateInfo || updateInfo.notes.length === 0) && (
                <Text className="text-center py-4 text-gray-500">
                  이번 업데이트에서 개선된 사항이 있어요.
                </Text>
              )}
            </ScrollView>


          </>
        )}

      </VStack>

      <VStack space="xs" style={{ paddingBottom: insets.bottom }}>
        {!isLoading && updateInfo?.notes && updateInfo.notes.length > 0 && (
          <Animated.View
            style={{
              opacity: fadeAnim,
              alignItems: 'center',
              display: hasScrolled ? 'none' : 'flex',
            }}
          >
            <HStack space="xs" className="items-center justify-center animate-bounce">
              <Text size="sm" className="text-gray-500">
                스크롤해서 더 보기
              </Text>
              <Icon as={ChevronDown} size="xs" className="text-gray-500" />
            </HStack>
          </Animated.View>
        )}
        <Button size="lg" onPress={handleConfirm} className="mt-4">
          <ButtonText>확인했어요</ButtonText>
        </Button>
      </VStack>
      {/* {isImageOpen && <VStack className="fixed top-0 left-0 right-0 bottom-0 bg-black/5">
        <Button variant="icon" onPress={() => setIsImageOpen(false)}>
          <ButtonIcon as={X} />
        </Button>
        <Image
          source={{ uri: selectedImageUrl }}
          style={{ width: '100%', height: 400 }}
          contentFit="cover"
          className="w-full h-40 rounded-lg"
          alt="update"
        />
      </VStack>} */}
    </VStack>
  );
}
