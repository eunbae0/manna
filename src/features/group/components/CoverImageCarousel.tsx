import { useState } from 'react';
import { router } from 'expo-router';
import { useWindowDimensions, View } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import Carousel from 'react-native-reanimated-carousel';

import AnimatedPressable from '@/components/common/animated-pressable';
import { HStack } from '#/components/ui/hstack';
import { ButtonIcon } from '@/components/common/button';
import { useAuthStore } from '@/store/auth';
import { ImageIcon } from 'lucide-react-native';
import { Text } from '@/shared/components/text';
import { useGroup } from '@/features/group/hooks/useGroup';
import { getImageSourceForSignedImageUrl } from '@/shared/utils/image';

export function CoverImageCarousel() {
	const { user, currentGroup } = useAuthStore();
	const { width } = useWindowDimensions();
	const { group, isLoading: isGroupsLoading } = useGroup(currentGroup?.groupId);

	const [activeIndex, setActiveIndex] = useState(0);

	const handlePressManageImages = () => {
		router.push('/(app)/(group)/cover-images-management');
	};

	const coverImages =
		group?.coverImages?.sort((a, b) => a.order - b.order) || [];

	const isLeader =
		group?.members.find((member) => member.id === user?.id)?.role === 'leader';

	const hasCoverImages = coverImages.length > 0;

	return (
		<View className="relative w-full h-[200px]">
			{hasCoverImages ? (
				<Carousel
					width={width}
					height={200}
					data={coverImages}
					onSnapToItem={(index) => setActiveIndex(index)}
					autoPlay={coverImages.length > 1}
					autoPlayInterval={4000}
					renderItem={({ item }) => (
						<View>
							<Image
								source={getImageSourceForSignedImageUrl(item.uri)}
								style={{
									width: '100%',
									height: 200,
								}}
								contentFit="cover"
								priority="high"
								cachePolicy="memory-disk"
							/>
						</View>
					)}
				/>
			) : (
				<View className="h-full justify-center items-center bg-gray-100 rounded-lg">
					<ImageIcon size={48} color="#ccc" />
					<Text size="md" className="text-typography-500 mt-3">
						그룹 커버 이미지가 없어요.
					</Text>
					{isLeader && (
						<Text size="sm" className="text-typography-500 mt-2">
							'이미지 관리' 버튼을 눌러 이미지를 추가해보세요
						</Text>
					)}
				</View>
			)}

			{/* 그라데이션 오버레이 - 캐러셀 밖에 배치하여 한 번만 렌더링 */}
			{hasCoverImages && (
				<View
					className="absolute bottom-0 w-full h-[120px] z-10"
					pointerEvents="none"
				>
					<LinearGradient
						colors={['transparent', 'rgba(0,0,0,0.4)']}
						locations={[0.3, 1]}
						start={{ x: 0.5, y: 0 }}
						end={{ x: 0.5, y: 1 }}
						style={{ width: '100%', height: '100%' }}
					/>
				</View>
			)}

			{/* 페이지 인디케이터 */}
			{hasCoverImages && (
				<View className="absolute bottom-3 w-full flex-row justify-center items-center z-20">
					<HStack space="xs" className="items-center">
						{coverImages.map((item, index) => (
							<View
								key={item.uri}
								className={`h-[3px] rounded-full ${activeIndex === index ? 'w-4 bg-background-50' : 'w-1.5 bg-background-50/50'}`}
							/>
						))}
					</HStack>
				</View>
			)}

			{isLeader && (
				<AnimatedPressable scale="xs" onPress={handlePressManageImages}>
					<HStack
						space="xs"
						className="absolute bottom-2 right-3 items-center z-30 rounded-md px-2.5 py-1 bg-gray-900/40"
					>
						<ButtonIcon size="md" as={ImageIcon} className="text-white" />
						<Text size="sm" className="text-white">
							이미지 관리
						</Text>
					</HStack>
				</AnimatedPressable>
			)}
		</View>
	);
}
