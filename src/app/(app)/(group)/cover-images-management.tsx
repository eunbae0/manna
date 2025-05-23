import { useState, useCallback, useEffect } from 'react';
import { Alert, FlatList, View, ActivityIndicator, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { ImageIcon, PlusIcon, TrashIcon, ArrowUpDownIcon } from 'lucide-react-native';

import Header from '@/components/common/Header';
import { VStack } from '#/components/ui/vstack';
import { HStack } from '#/components/ui/hstack';
import { Text } from '@/shared/components/text';
import { Button, ButtonText, ButtonIcon } from '@/components/common/button';
import { KeyboardDismissView } from '@/components/common/keyboard-view/KeyboardDismissView';
import { useAuthStore } from '@/store/auth';
import { useGroup } from '@/features/home/group/hooks/useGroup';
import type { CoverImage, UpdateGroupInput } from '@/api/group/types';
import { useToastStore } from '@/store/toast';
import Heading from '@/shared/components/heading';
import AnimatedPressable from '@/components/common/animated-pressable';

const MAX_IMAGE_COUNT = 3;

export default function CoverImagesManagement() {
  const { currentGroup } = useAuthStore();
  const { group, isLoading, updateGroup, isUpdating: isGroupUpdating } = useGroup(currentGroup?.groupId);
  const { showToast } = useToastStore();

  const [images, setImages] = useState<CoverImage[]>([]);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isReordering, setIsReordering] = useState(false);

  // Initialize images state from group data when loaded
  useEffect(() => {
    if (group?.coverImages) {
      setImages([...group.coverImages].sort((a, b) => a.order - b.order));
    }
  }, [group]);

  // Update cover images using the existing updateGroup function
  const updateCoverImages = async (updatedImages: CoverImage[], action?: 'add' | 'remove' | 'reorder') => {
    if (!currentGroup?.groupId) return;

    try {
      setIsUpdating(true);

      const updateData: UpdateGroupInput = {
        coverImages: updatedImages,
      };

      // Get appropriate success message based on the action
      let successMessage = '커버 이미지가 업데이트되었어요.';
      if (action === 'add') {
        successMessage = '새 이미지가 추가되었어요.';
      } else if (action === 'remove') {
        successMessage = '이미지가 삭제되었어요.';
      } else if (action === 'reorder') {
        successMessage = '이미지 순서가 변경되었어요.';
      }

      // Use the existing updateGroup function with custom success message
      await updateGroup(updateData, successMessage);
    } catch (error) {
      console.error('Error updating cover images:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleAddImage = async () => {
    if (images.length >= MAX_IMAGE_COUNT) {
      showToast({
        type: 'info',
        title: '알림',
        message: `이미지는 최대 ${MAX_IMAGE_COUNT}개까지 추가할 수 있어요.`,
      });
      return;
    }

    try {
      // Request permissions
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permissionResult.granted) {
        showToast({
          type: 'error',
          title: '권한 필요',
          message: '갤러리 접근 권한이 필요해요.',
        });
        return;
      }

      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
        allowsMultipleSelection: false,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const selectedImageUri = result.assets[0].uri;

        // Get current order values and determine next order
        const maxOrder = images.length > 0
          ? Math.max(...images.map(img => img.order))
          : -1;

        // Create new image
        const newImage: CoverImage = {
          uri: selectedImageUri,
          order: maxOrder + 1,
        };

        // Add to current images and update
        const updatedImages = [...images, newImage];
        await updateCoverImages(updatedImages, 'add');
      }
    } catch (error) {
      console.error('Error selecting image:', error);
      showToast({
        type: 'error',
        title: '오류',
        message: '이미지 선택 중 오류가 발생했어요.',
      });
    }
  };

  const handleRemoveImage = (imageUri: string) => {
    Alert.alert(
      '이미지 삭제',
      '이 이미지를 삭제할까요?',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '삭제',
          style: 'destructive',
          onPress: async () => {
            try {
              // Filter out the image to remove
              const filteredImages = images.filter(img => img.uri !== imageUri);

              // Reorder the remaining images
              const reorderedImages = filteredImages.map((img, index) => ({
                ...img,
                order: index,
              }));

              await updateCoverImages(reorderedImages, 'remove');
            } catch (error) {
              console.error('Error removing image:', error);
            }
          }
        },
      ]
    );
  };

  const moveImage = (imageUri: string, direction: 'up' | 'down') => {
    // Find current image index
    const currentIndex = images.findIndex(img => img.uri === imageUri);
    if (currentIndex === -1) return;

    // Calculate new index
    const newIndex = direction === 'up'
      ? Math.max(0, currentIndex - 1)
      : Math.min(images.length - 1, currentIndex + 1);

    // Don't do anything if already at the edge
    if (newIndex === currentIndex) return;

    // Create a copy of the array and swap items
    const updatedImages = [...images];
    [updatedImages[currentIndex], updatedImages[newIndex]] =
      [updatedImages[newIndex], updatedImages[currentIndex]];

    // Update order properties
    const reorderedImages = updatedImages.map((img, index) => ({
      ...img,
      order: index,
    }));

    // Save new order
    setImages(reorderedImages);
    updateCoverImages(reorderedImages, 'reorder');
  };

  const toggleReordering = () => {
    setIsReordering(!isReordering);
  };

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <Header />
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#0000ff" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardDismissView className="flex-1">
        <Header />

        <VStack space="md" className="p-4 flex-1">
          <Heading size="2xl">커버 이미지 관리하기</Heading>

          <Text size="md" className='text-typography-500'>
            이미지는 최대 {MAX_IMAGE_COUNT}개까지 추가할 수 있어요.
          </Text>

          {/* Action buttons */}
          <HStack space="md" className="my-2">
            <Button
              className="flex-1"
              onPress={handleAddImage}
              disabled={images.length >= MAX_IMAGE_COUNT || isUpdating || isGroupUpdating}
            >
              <ButtonText>{isUpdating || isGroupUpdating ? '업데이트 중...' : '이미지 추가'}</ButtonText>
              <ButtonIcon as={PlusIcon} />
            </Button>

            {images.length > 1 && (
              <Button
                variant="outline"
                className="flex-1"
                onPress={toggleReordering}
              >
                <ButtonText>{isReordering ? '순서 변경 완료' : '순서 변경'}</ButtonText>
                <ButtonIcon as={ArrowUpDownIcon} />
              </Button>
            )}
          </HStack>

          {/* Images list */}
          {images.length === 0 ? (
            <View className="h-[180px] justify-center items-center bg-gray-100 rounded-lg">
              <ImageIcon size={48} color="#ccc" />
              <Text size="md" className="text-typography-600 mt-4">
                그룹 커버 이미지가 없어요
              </Text>
              <Text size="sm" className="text-typography-600 mt-2">
                '이미지 추가' 버튼을 눌러 이미지를 추가해보세요
              </Text>
            </View>
          ) : isReordering ? (
            <FlatList
              data={images}
              keyExtractor={(item: CoverImage) => item.uri}
              renderItem={({ item, index }: { item: CoverImage; index: number }) => (
                <View className="mb-3 rounded-lg overflow-hidden">
                  <Image
                    source={{ uri: item.uri }}
                    style={{ width: '100%', height: 160 }}
                    contentFit="cover"
                  />
                  {index > 0 && (
                    <AnimatedPressable
                      className="absolute top-2 right-2 bg-black/50 rounded-md px-2 py-1"
                      onPress={() => moveImage(item.uri, 'up')}
                      disabled={isUpdating}
                    >
                      <Text className="text-white">↑</Text>
                    </AnimatedPressable>
                  )}
                  {index < images.length - 1 && (
                    <AnimatedPressable
                      className="absolute top-2 right-2 bg-black/50 rounded-md px-2 py-1"
                      onPress={() => moveImage(item.uri, 'down')}
                      disabled={isUpdating}
                    >
                      <Text className="text-white">↓</Text>
                    </AnimatedPressable>
                  )}
                </View>
              )}
              showsVerticalScrollIndicator={false}
            />
          ) : (
            <FlatList
              data={images}
              keyExtractor={(item: CoverImage) => item.uri}
              renderItem={({ item }: { item: CoverImage }) => (
                <View className="mb-3 relative">
                  <Image
                    source={{ uri: item.uri }}
                    style={{ width: '100%', height: 160 }}
                    contentFit="cover"
                    className="rounded-lg"
                  />
                  <TouchableOpacity
                    className="absolute top-2 right-2 bg-black/50 rounded-full p-2"
                    onPress={() => handleRemoveImage(item.uri)}
                    disabled={isUpdating}
                  >
                    <TrashIcon size={16} color="white" />
                  </TouchableOpacity>
                </View>
              )}
              showsVerticalScrollIndicator={false}
            />
          )}
        </VStack>
      </KeyboardDismissView>
    </SafeAreaView>
  );
}