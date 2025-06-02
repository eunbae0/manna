import React from 'react';
import { ScrollView, TouchableOpacity } from 'react-native';
import { HStack } from '#/components/ui/hstack';
import { Text } from '@/shared/components/text';
import { Icon } from '#/components/ui/icon';
import { PlusIcon } from 'lucide-react-native';
import { useWorshipStore } from '@/store/worship';
import type { ClientWorshipType } from '@/api/worship-types/types';
import { router } from 'expo-router';
import { WorshipTypeSelectorSkeleton } from './WorshipTypeSelectorSkeleton';
import { trackAmplitudeEvent } from '@/shared/utils/amplitude';
import FilterTag from '@/shared/components/filter-tag';

export function WorshipTypeSelector() {
	const {
		worshipTypes,
		selectedWorshipType,
		setSelectedWorshipType,
		isLoading,
	} = useWorshipStore();

	const handlePressItem = (type: ClientWorshipType) => {
		if (selectedWorshipType?.name === type.name) {
			setSelectedWorshipType(null);
		} else {
			setSelectedWorshipType(type);
		}
	};

	const handlePressPlusButton = () => {
		router.push('/(app)/selectWorshipTypeModal');
	}

	if (isLoading) {
		return <WorshipTypeSelectorSkeleton />;
	}

	return (
		<ScrollView
			horizontal
			showsHorizontalScrollIndicator={false}
			contentContainerStyle={{ paddingRight: 20 }}
			className="flex-grow"
		>
			<HStack space="sm" className="py-1 items-center">
				<FilterTag
					key="all"
					label="전체"
					onPress={() => setSelectedWorshipType(null)}
					isSelected={selectedWorshipType === null}
				/>
				{worshipTypes.map((type) => (
					<FilterTag
						key={type.name}
						label={type.name}
						onPress={() => handlePressItem(type)}
						isSelected={selectedWorshipType?.name === type.name}
					/>
				))}
				<FilterTag
					onPress={handlePressPlusButton}
					label="+"
					isSelected={false}
				/>
			</HStack>
		</ScrollView>
	);
}
