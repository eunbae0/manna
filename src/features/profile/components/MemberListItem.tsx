import { HStack } from '#/components/ui/hstack';
import { VStack } from '#/components/ui/vstack';
import { Text } from '@/shared/components/text';
import { Box } from '#/components/ui/box';
import { Avatar } from '@/components/common/avatar';
import AnimatedPressable from '@/components/common/animated-pressable';
import type { GroupMember } from '@/api/group/types';
import { Button, ButtonIcon } from '@/components/common/button';
import { MoreHorizontal } from 'lucide-react-native';

export function MemberListItem({
	member,
	handlePressManageMember,
	...props
}: {
	member: GroupMember;
	handlePressManageMember?: () => void;
} & Omit<React.ComponentProps<typeof AnimatedPressable>, 'children'>) {
	return (
		<AnimatedPressable
			{...props}
			scale="sm"
			withBackground
			pressableClassName="py-3 pl-5 pr-2"
		>
			<HStack className="items-center justify-between">
				<HStack space="lg" className="items-center">
					<HStack space="md" className="items-center">
						<Avatar size="md" photoUrl={member.photoUrl ?? undefined} />
						<VStack className="gap-[2px]">
							<HStack space="sm" className="items-center">
								<Text size="lg">{member.displayName ?? '이름없음'}</Text>
								<Box
									className={
										member.role === 'leader'
											? 'px-2 rounded-2xl py-[2px] bg-primary-50 border border-primary-200'
											: 'px-2 rounded-2xl py-[2px] bg-background-100 border border-background-200'
									}
								>
									<Text
										size="xs"
										weight="semi-bold"
										className="text-typography-500"
									>
										{member.role === 'leader' ? '리더' : '그룹원'}
									</Text>
								</Box>
							</HStack>

							<Text size="md" className="text-typography-600/80">
								{member?.statusMessage}
							</Text>
						</VStack>
					</HStack>
				</HStack>
				{handlePressManageMember && (
					<Button onPress={handlePressManageMember} variant="icon">
						<ButtonIcon as={MoreHorizontal} />
					</Button>
				)}
			</HStack>
		</AnimatedPressable>
	);
}
