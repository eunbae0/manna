import { Button, ButtonIcon } from '#/components/ui/button';
import { HStack } from '#/components/ui/hstack';
import { Heading } from '#/components/ui/heading';
import { Icon } from '#/components/ui/icon';
import {
	ChevronDownIcon,
	SettingsIcon,
	MenuIcon,
	UserRound,
} from 'lucide-react-native';
import { Avatar, AvatarBadge, AvatarGroup } from '#/components/ui/avatar';

function HomeHeader() {
	return (
		<HStack className="justify-between pt-2">
			<HStack space="md" className="items-center">
				<Heading size="2xl">길동 사랑방</Heading>
				<Button size="xl" variant="link">
					<ButtonIcon as={ChevronDownIcon} />
				</Button>
			</HStack>
			<HStack space="xl" className="px-1">
				<Button size="xl" variant="link">
					<ButtonIcon as={SettingsIcon} />
				</Button>
				{/* <AvatarGroup className="justify-between items-center">
					<Avatar size="xs" className="bg-yellow-600">
						<Icon as={UserRound} size="xs" className="stroke-white" />
						<AvatarBadge className="bg-yellow-400" />
					</Avatar>
					<Avatar size="xs" className="bg-yellow-600">
						<Icon as={UserRound} size="xs" className="stroke-white" />
					</Avatar>
					<Avatar size="xs" className="bg-yellow-600">
						<Icon as={UserRound} size="xs" className="stroke-white" />
					</Avatar>
				</AvatarGroup> */}
				<Button size="xl" variant="link">
					<ButtonIcon as={MenuIcon} />
				</Button>
			</HStack>
		</HStack>
	);
}

export default HomeHeader;
