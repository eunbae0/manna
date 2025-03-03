import { Pressable } from 'react-native';
import { Button, ButtonIcon } from '#/components/ui/button';
import { HStack } from '#/components/ui/hstack';
import { Heading } from '#/components/ui/heading';
import { Icon } from '#/components/ui/icon';
import {
	ChevronDown,
	MenuIcon,
	UserRound,
	HandHelping,
	Library,
	UserRoundPen,
	X,
} from 'lucide-react-native';
import { Avatar, AvatarBadge, AvatarGroup } from '#/components/ui/avatar';
import { Divider } from '#/components/ui/divider';
import { Text } from '#/components/ui/text';
import { VStack } from '#/components/ui/vstack';

import { useBottomSheet } from '@/components/common/BottomSheetProvider';

function HomeHeader() {
	const { handleOpen, handleClose, BottomSheetContainer } = useBottomSheet();

	return (
		<HStack className="items-center justify-between pt-2 px-4">
			<HStack space="xs" className="items-center">
				<Heading className="text-[24px]">길동 사랑방</Heading>
				<Button size="xl" variant="link">
					<ButtonIcon
						as={ChevronDown}
						width={24}
						height={24}
						className="color-typography-900"
					/>
				</Button>
			</HStack>
			<HStack space="xl" className="px-1">
				<AvatarGroup className="justify-between items-center">
					<Avatar size="sm" className="bg-primary-400">
						<Icon as={UserRound} size="sm" className="stroke-white" />
					</Avatar>
					<Avatar size="sm" className="bg-primary-400">
						<Icon as={UserRound} size="sm" className="stroke-white" />
						<AvatarBadge className="bg-yellow-400" />
					</Avatar>
				</AvatarGroup>

				<Button size="xl" variant="link" onPress={() => handleOpen()}>
					<ButtonIcon
						as={MenuIcon}
						width={24}
						height={24}
						className="color-typography-900"
					/>
				</Button>
			</HStack>
			<BottomSheetContainer>
				<VStack className="w-full px-5 pt-2 pb-12">
					<HStack className="justify-between items-center px-2">
						<Heading size="xl">소그룹 메뉴</Heading>
						<Button size="xl" variant="link">
							<ButtonIcon as={X} />
						</Button>
					</HStack>
					<VStack space="sm" className="w-full py-5">
						<Pressable onPress={handleClose}>
							<HStack space="md" className="items-center py-2">
								<Icon
									size="xl"
									className="stroke-background-700"
									as={HandHelping}
								/>
								<Text>기도 제목</Text>
							</HStack>
						</Pressable>
						<Divider />
						<Pressable onPress={handleClose}>
							<HStack space="md" className="items-center py-2">
								<Icon
									size="xl"
									className="stroke-background-700"
									as={Library}
								/>
								<Text>나눔 기록</Text>
							</HStack>
						</Pressable>
						<Divider />
						<Pressable onPress={handleClose}>
							<HStack space="md" className="items-center py-2">
								<Icon
									size="xl"
									className="stroke-background-700"
									as={UserRoundPen}
								/>
								<Text>소그룹원 관리하기</Text>
							</HStack>
						</Pressable>
					</VStack>
				</VStack>
			</BottomSheetContainer>
		</HStack>
	);
}

export default HomeHeader;
