import { useCallback } from 'react';
import { Image } from 'expo-image';
import { VStack } from '#/components/ui/vstack';
import { Text } from '@/shared/components/text';
import { useGroups } from '@/features/group/hooks/useGroups';
import type { ClientGroup } from '@/api/group/types';
import type { UserGroup } from '@/shared/types';
import { FlashList } from '@shopify/flash-list';
import { View } from 'react-native';
import AnimatedPressable from '@/components/common/animated-pressable';
import { router } from 'expo-router';
import { useAuthStore } from '@/store/auth';
import HomeUserGroupListSkeleton from './HomeUserGroupListSkeleton';
import { getImageSourceForSignedImageUrl } from '@/shared/utils/image';

type Props = {
	groups: UserGroup[];
};

export function HomeUserGroupList({ groups }: Props) {
	const { groups: groupsData, isLoading } = useGroups(groups);
	return (
		<View className="w-full">
			{isLoading ? (
				<HomeUserGroupListSkeleton />
			) : (
				<FlashList
					data={groupsData}
					horizontal
					renderItem={({ item }) => <GroupItem group={item} />}
					style={{ width: '100%' }}
					keyExtractor={(item) => item.id}
					estimatedListSize={{ width: 120, height: 90 }}
					estimatedItemSize={120}
					showsHorizontalScrollIndicator={false}
				/>
			)}
		</View>
	);
}

function GroupItem({ group }: { group: ClientGroup }) {
	const hasCoverImage = group.coverImages?.length;

	const { uri } = group.coverImages?.[0] || {};
	const { updateCurrentGroup } = useAuthStore();

	const handlePressGroupItem = useCallback(() => {
		router.push('/(app)/(group)/(tabs)/home');
		updateCurrentGroup({
			groupId: group.id,
		});
	}, [group.id, updateCurrentGroup]);

	return (
		<AnimatedPressable onPress={handlePressGroupItem}>
			<VStack space="sm" className="items-center pr-4">
				{hasCoverImage ? (
					<Image
						source={getImageSourceForSignedImageUrl(uri)}
						contentFit="cover"
						style={{ width: 120, height: 80, borderRadius: 14 }}
						priority="high"
						cachePolicy="memory-disk"
					/>
				) : (
					<View
						style={{ width: 120, height: 80, borderRadius: 14 }}
						className="items-center justify-center bg-primary-100"
					>
						<Image
							source={require('../../../../assets/images/icons/manna_icon_beige.png')}
							style={{ width: 58, height: 40, opacity: 0.8 }}
							contentFit="cover"
						/>
					</View>
				)}
				<Text size="sm" weight="medium" className="text-typography-800">
					{group.groupName}
				</Text>
			</VStack>
		</AnimatedPressable>
	);
}
