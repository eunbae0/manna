import type React from 'react';
import { VStack } from '#/components/ui/vstack';
import { Pressable, ScrollView } from 'react-native';
import { Avatar } from '@/components/common/avatar';
import { Icon } from '#/components/ui/icon';
import { Divider } from '#/components/ui/divider';
import { Text } from '@/shared/components/text';
import { HStack } from '#/components/ui/hstack';
import { ChevronRight, Plus } from 'lucide-react-native';

import { useBottomSheet } from '@/hooks/useBottomSheet';
import { Button, ButtonText } from '@/components/common/button';
import { Textarea, TextareaInput } from '#/components/ui/textarea';
import { BottomSheetListHeader } from '@/components/common/bottom-sheet';
import { useState } from 'react';
import { cn } from '@/shared/utils/cn';
import type {
	ClientFellowship,
	ClientFellowshipAnswerField,
	ClientFellowshipMember,
} from '@/features/fellowship/api/types';
import { BottomSheetTextInput } from '@gorhom/bottom-sheet';
import { TEXT_INPUT_STYLE } from '@/components/common/text-input';

type PrayerRequestProps = {
	members: ClientFellowshipMember[];
	prayerRequests: ClientFellowshipAnswerField[];
	setFellowship: (
		updater: (prev: ClientFellowship) => ClientFellowship,
	) => void;
};

const PrayerRequestList = ({
	members,
	prayerRequests,
	setFellowship,
}: PrayerRequestProps) => {
	const {
		handleOpen: handleOpenPrayerRequest,
		handleClose: handleClosePrayerRequest,
		BottomSheetContainer: BottomSheetPrayerRequestContainer,
	} = useBottomSheet();

	const [content, setContent] = useState<ClientFellowshipAnswerField[]>([
		...prayerRequests,
		...members
			.filter(
				(member) =>
					!prayerRequests.find((answer) => answer.member.id === member.id),
			)
			.map((member) => ({ member, value: '' })),
	]);

	const [selectedMember, setSelectedMember] = useState<ClientFellowshipMember>(
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
					prayerRequest: {
						...prev.content.prayerRequest,
						answers: [...newContent],
					},
				},
			};
		});
		handleClosePrayerRequest();
	};

	const handlePressPrayerRequest = (member?: ClientFellowshipMember) => {
		if (member) setSelectedMember(member);
		handleOpenPrayerRequest();
	};

	return (
		<>
			<VStack space="md">
				{prayerRequests.length > 0 ? (
					prayerRequests.map(({ member, value }) => (
						<Pressable
							key={member.id}
							onPress={() => handlePressPrayerRequest(member)}
						>
							<VStack
								space="md"
								className="bg-background-100 rounded-xl py-4 px-4"
							>
								<HStack space="md" className="items-center">
									<Avatar key={member.id} size="xs" />
									<Text size="md">{member.displayName}</Text>
								</HStack>
								<Text size="lg">{value}</Text>
							</VStack>
						</Pressable>
					))
				) : (
					<Pressable onPress={() => handlePressPrayerRequest()}>
						<HStack
							space="md"
							className="bg-white rounded-xl py-4 px-4 items-center justify-between"
						>
							<Text size="lg">기도제목을 추가해보세요</Text>
							<Icon as={ChevronRight} size="md" className="text-primary-500" />
						</HStack>
					</Pressable>
				)}
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
														<Avatar size="xs" />
														<Text size="md">{member.displayName}</Text>
													</HStack>
												</Pressable>
											))}
										</HStack>
									</ScrollView>
									<Pressable className="p-2">
										<Icon as={Plus} size="md" className="text-primary-500" />
									</Pressable>
								</HStack>
								<Divider />
							</VStack>
							<Textarea size="lg">
								<BottomSheetTextInput
									defaultValue={content[memberIndex].value}
									onChangeText={(value) =>
										setContent([
											...content.slice(0, memberIndex),
											{ ...content[memberIndex], value: value },
											...content.slice(memberIndex + 1),
										])
									}
									placeholder="나눔을 입력해주세요..."
									className={TEXT_INPUT_STYLE}
								/>
							</Textarea>
						</VStack>
						<Button size="lg" rounded onPress={handlePressSaveButton}>
							<ButtonText>저장하기</ButtonText>
						</Button>
					</VStack>
				</VStack>
			</BottomSheetPrayerRequestContainer>
		</>
	);
};

export default PrayerRequestList;
