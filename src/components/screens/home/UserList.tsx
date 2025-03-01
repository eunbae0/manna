import { ScrollView } from 'react-native';

import { Avatar, AvatarBadge } from '#/components/ui/avatar';
import { Button, ButtonIcon } from '#/components/ui/button';
import { HStack } from '#/components/ui/hstack';
import { VStack } from '#/components/ui/vstack';
import { Text } from '#/components/ui/text';
import { Icon } from '#/components/ui/icon';
import { UserRound, PlusIcon } from 'lucide-react-native';

function UserList() {
	return (
		<ScrollView horizontal={true}>
			<HStack space="xl" className="px-1 items-start">
				<VStack space="sm" className="items-center">
					<Avatar className="bg-yellow-600">
						<Icon as={UserRound} size="xl" className="stroke-white" />
						<AvatarBadge className="bg-yellow-400" />
					</Avatar>
					<Text size="sm" bold={true}>
						홍길동
					</Text>
				</VStack>
				<VStack space="sm" className="items-center">
					<Avatar className="bg-yellow-600">
						<Icon as={UserRound} size="xl" className="stroke-white" />
					</Avatar>
					<Text size="sm" bold={true}>
						김철수
					</Text>
				</VStack>
				<VStack space="sm" className="items-center">
					<Avatar className="bg-yellow-600">
						<Icon as={UserRound} size="xl" className="stroke-white" />
					</Avatar>
					<Text size="sm" bold={true}>
						김영희
					</Text>
				</VStack>
				<Button
					variant="outline"
					className="w-[42px] h-[42px] m-[2px] rounded-full"
				>
					<ButtonIcon size="sm" as={PlusIcon} className="color-yellow-700" />
				</Button>
			</HStack>
		</ScrollView>
	);
}

export default UserList;
