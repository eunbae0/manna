import { HStack } from '#/components/ui/hstack';
import { VStack } from '#/components/ui/vstack';
import { useState } from 'react';
import { Switch } from 'react-native';
import { Text } from '#/components/ui/text';

interface Props {
	title: string;
	description: string;
	enabled: boolean;
	onValueChange: (value: boolean) => void;
}

export const NotificationSettingItem = ({
	title,
	description,
	enabled,
	onValueChange,
}: Props) => {
	return (
		<HStack className="justify-between items-center">
			<VStack space="xs" className="flex-1 mr-4">
				<Text size="xl" className="font-pretendard-bold">
					{title}
				</Text>
				<Text className="text-typography-500">{description}</Text>
			</VStack>
			<Switch value={enabled} onValueChange={onValueChange} />
		</HStack>
	);
};
