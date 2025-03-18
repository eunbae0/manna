import type React from 'react';
import { VStack } from '#/components/ui/vstack';
import { Pressable, ScrollView } from 'react-native';
import { Avatar, AvatarBadge } from '#/components/ui/avatar';
import { Icon } from '#/components/ui/icon';
import { Divider } from '#/components/ui/divider';
import { Text } from '#/components/ui/text';
import { HStack } from '#/components/ui/hstack';
import { Plus, UserRound } from 'lucide-react-native';
import type {
	Fellowship,
	FellowshipAnswerField,
	FellowshipMember,
} from '@/store/createFellowship';
import { useBottomSheet } from '@/hooks/useBottomSheet';
import { Button, ButtonText } from '#/components/ui/button';
import { Textarea, TextareaInput } from '#/components/ui/textarea';
import { BottomSheetListHeader } from '@/components/common/BottomSheet';
import { type Dispatch, useState } from 'react';
import { cn } from '@/utils/cn';

type PrayerRequestProps = {
	members: FellowshipMember[];
	prayerRequests: FellowshipAnswerField[];
	setFellowship: Dispatch<React.SetStateAction<Fellowship>>;
	isEditing: boolean;
};

const PrayerRequestList = ({
	members,
	prayerRequests,
	setFellowship,
	isEditing,
}: PrayerRequestProps) => {
	const {
		handleOpen: handleOpenPrayerRequest,
		handleClose: handleClosePrayerRequest,
		BottomSheetContainer: BottomSheetPrayerRequestContainer,
	} = useBottomSheet();

	const [content, setContent] = useState<FellowshipAnswerField[]>([
		...prayerRequests,
		...members
			.filter(
				(member) =>
					!prayerRequests.find((answer) => answer.member.id === member.id),
			)
			.map((member) => ({ member, value: '' })),
	]);

	const [selectedMember, setSelectedMember] = useState<FellowshipMember>(
		members[0],
	);
	const memberIndex = members.findIndex(
		(member) => member.id === selectedMember.id,
	);

	const handlePressSaveButton = () => {
		setFellowship((prev) => {
			const newContent = content.filter((answer) => answer.value !== '');

			return {
				...prev,
				content: {
					...prev.content,
					prayerRequest: [...newContent],
				},
			};
		});
		handleClosePrayerRequest();
	};

	const handlePressPrayerRequest = (member: FellowshipMember) => {
		setSelectedMember(member);
		handleOpenPrayerRequest();
	};

	return (
		<>
			<VStack space="md">
				{prayerRequests.map(({ member, value }) => (
					<Pressable
						key={member.id}
						onPress={
							isEditing ? () => handlePressPrayerRequest(member) : undefined
						}
					>
						<VStack space="md" className="bg-white rounded-xl py-4 px-4">
							<HStack space="md" className="items-center">
								<Avatar key={member.id} size="xs" className="bg-primary-400">
									<Icon as={UserRound} size="sm" className="stroke-white" />
									<AvatarBadge className="bg-yellow-400" />
								</Avatar>
								<Text size="md">{member.displayName}</Text>
							</HStack>
							<Text size="lg">{value}</Text>
						</VStack>
					</Pressable>
				))}
			</VStack>
			<BottomSheetPrayerRequestContainer>
				<VStack space="sm" className="px-6 py-2">
					<BottomSheetListHeader
						label="기도 제목"
						onPress={() => handleClosePrayerRequest()}
					/>
					<VStack className="gap-14">
						<VStack space="2xl">
							<VStack>
								<HStack className="items-center justify-between">
									<ScrollView horizontal>
										<HStack>
											{members.map((member) => (
												<Pressable
													key={member.id}
													onPress={() => setSelectedMember(member)}
												>
													<HStack
														space="sm"
														className={cn(
															'items-center px-3 py-2',
															selectedMember.id === member.id
																? 'border-b-2 border-primary-500'
																: 'text-typography-700',
														)}
													>
														<Avatar size="xs" className="bg-primary-400">
															<Icon
																as={UserRound}
																size="sm"
																className="stroke-white"
															/>
															<AvatarBadge className="bg-yellow-400" />
														</Avatar>
														<Text size="md">{member.displayName}</Text>
													</HStack>
												</Pressable>
											))}
										</HStack>
									</ScrollView>
									<Pressable className="p-2">
										<Icon as={Plus} size="md" className="stroke-primary-500" />
									</Pressable>
								</HStack>
								<Divider />
							</VStack>
							<Textarea size="lg">
								<TextareaInput
									value={content[memberIndex].value}
									onChangeText={(value) =>
										setContent([
											...content.slice(0, memberIndex),
											{ ...content[memberIndex], value: value },
											...content.slice(memberIndex + 1),
										])
									}
									placeholder="나눔을 입력해주세요..."
								/>
							</Textarea>
						</VStack>
						<Button
							size="lg"
							className="rounded-full"
							onPress={handlePressSaveButton}
						>
							<ButtonText>저장하기</ButtonText>
						</Button>
					</VStack>
				</VStack>
			</BottomSheetPrayerRequestContainer>
		</>
	);
};

export default PrayerRequestList;
