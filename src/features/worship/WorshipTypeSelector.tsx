import React from 'react';
import { ScrollView, TouchableOpacity } from 'react-native';
import { HStack } from '#/components/ui/hstack';
import { Text } from '#/components/ui/text';
import { Icon } from '#/components/ui/icon';
import { PlusIcon } from 'lucide-react-native';
import { useWorshipStore } from '@/store/worship';
import type { ClientWorshipType } from '@/api/worship-types/types';
import { router } from 'expo-router';
import { WorshipTypeSelectorSkeleton } from './WorshipTypeSelectorSkeleton';

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
				{worshipTypes.map((type) => (
					<TouchableOpacity
						key={type.name}
						onPress={() => handlePressItem(type)}
						className="mr-1"
					>
						<Text
							size="md"
							className={`px-3 py-1 rounded-full ${
								selectedWorshipType?.name === type.name
									? 'bg-primary-100 text-primary-700'
									: 'bg-background-0 text-typography-700'
							}`}
						>
							{type.name}
						</Text>
					</TouchableOpacity>
				))}
				<TouchableOpacity
					onPress={() => router.push('/(app)/selectWorshipTypeModal')}
					className="mr-1"
				>
					<Icon
						as={PlusIcon}
						size="md"
						className="px-4 py-3 rounded-full bg-background-0 text-typography-700"
					/>
				</TouchableOpacity>
			</HStack>
		</ScrollView>
	);
}
