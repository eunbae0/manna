import React, { useEffect, useState } from 'react';
import { TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { Linking } from 'react-native';
import { Box } from '#/components/ui/box';
import { HStack } from '#/components/ui/hstack';
import { VStack } from '#/components/ui/vstack';
import { Text } from '@/shared/components/text';

// OG 태그 정보 타입 정의
interface OgMetadata {
  title?: string;
  description?: string;
  image?: string;
  url: string;
  isLoading: boolean;
  error?: string;
}

/**
 * OG 태그 정보를 가져오는 훅
 * 
 * @param url - OG 태그 정보를 가져올 URL
 * @returns OG 태그 정보
 */
function useOgMetadata(url: string): OgMetadata {
  const [metadata, setMetadata] = useState<OgMetadata>({
    url,
    isLoading: true,
  });

  useEffect(() => {
    // 임시 데이터로 대체 (실제로는 API를 통해 가져와야 함)
    // 실제 구현에서는 Firebase Functions 또는 외부 API를 사용하여 OG 태그 정보를 가져와야 합니다.
    const fetchOgMetadata = async () => {
      try {
        // 임시 데이터 (실제로는 API 호출 필요)
        // 예: const response = await fetch(`https://your-api.com/og-metadata?url=${encodeURIComponent(url)}`);
        // const data = await response.json();

        // 임시 데이터 (URL에 따라 다른 데이터 반환)
        const mockData = {
          title: url.includes('github')
            ? 'GitHub - 개발자를 위한 플랫폼'
            : (url.includes('youtube')
              ? 'YouTube - 동영상 플랫폼'
              : '웹사이트 제목'),
          description: url.includes('github')
            ? 'GitHub는 소프트웨어 개발을 위한 인터넷 호스팅 제공업체입니다.'
            : (url.includes('youtube')
              ? '전 세계 사용자가 만든 동영상을 시청하고 공유하고 업로드할 수 있습니다.'
              : '웹사이트 설명입니다.'),
          image: url.includes('github')
            ? 'https://github.githubassets.com/assets/github-logo-55c5b9a1fe3c.png'
            : (url.includes('youtube')
              ? 'https://www.youtube.com/img/desktop/yt_1200.png'
              : 'https://via.placeholder.com/150'),
        };

        // 1초 후에 데이터 설정 (로딩 효과를 위해)
        setTimeout(() => {
          setMetadata({
            ...mockData,
            url,
            isLoading: false,
          });
        }, 1000);
      } catch (error) {
        setMetadata({
          url,
          isLoading: false,
          error: '미리보기를 불러올 수 없습니다.',
        });
      }
    };

    fetchOgMetadata();
  }, [url]);

  return metadata;
}

interface LinkPreviewProps {
  url: string;
}

/**
 * 링크 미리보기 컴포넌트
 * 
 * @param url - 미리보기를 표시할 URL
 */
export function LinkPreview({ url }: LinkPreviewProps) {
  const metadata = useOgMetadata(url);

  if (metadata.isLoading) {
    return (
      <Box className="mt-2 mb-4 rounded-2xl border border-gray-200 p-3 bg-gray-50">
        <HStack space="md" className="items-center">
          <Box className="w-1/4 aspect-square rounded-xl bg-gray-200 flex items-center justify-center">
            <ActivityIndicator />
          </Box>
          <VStack space="xs" className="w-3/4">
            <Box className="h-4 w-3/4 bg-gray-200 rounded" />
            <Box className="h-3 w-1/2 bg-gray-200 rounded" />
          </VStack>
        </HStack>
      </Box>
    );
  }

  if (metadata.error) {
    return null;
  }

  return (
    <TouchableOpacity
      className="mt-2 mb-4"
      onPress={() => Linking.openURL(url)}
    >
      <Box className="rounded-2xl border border-gray-200 overflow-hidden">
        <HStack className="items-stretch">
          {metadata.image && (
            <Box className="w-1/4 aspect-square bg-gray-100">
              <Image
                source={{ uri: metadata.image }}
                className="w-full h-full"
                resizeMode="cover"
              />
            </Box>
          )}
          <VStack space="xs" className="w-3/4 p-3">
            {metadata.title && (
              <Text weight="bold" size="md" numberOfLines={1} className="text-typography-900">
                {metadata.title}
              </Text>
            )}
            {metadata.description && (
              <Text size="sm" numberOfLines={2} className="text-typography-700">
                {metadata.description}
              </Text>
            )}
            <Text size="xs" className="text-typography-500">
              {new URL(url).hostname}
            </Text>
          </VStack>
        </HStack>
      </Box>
    </TouchableOpacity>
  );
}
