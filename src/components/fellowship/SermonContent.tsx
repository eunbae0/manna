import type React from 'react';
import { VStack } from '#/components/ui/vstack';
import { Pressable, ScrollView } from 'react-native';
import { Avatar, AvatarBadge } from '#/components/ui/avatar';
import { Icon } from '#/components/ui/icon';
import { Divider } from '#/components/ui/divider';
import { Text } from '#/components/ui/text';
import { HStack } from '#/components/ui/hstack';
import { Plus, UserRound } from 'lucide-react-native';
import { useBottomSheet } from '@/hooks/useBottomSheet';
import { Button, ButtonText } from '#/components/ui/button';
import { Textarea, TextareaInput } from '#/components/ui/textarea';
import { BottomSheetListHeader } from '@/components/common/bottom-sheet';
import { useState } from 'react';
import { cn } from '@/utils/cn';
import type {
	ClientFellowship,
	FellowshipContentField,
	FellowshipMember,
} from '@/api/fellowship/types';

type SermonContentProps = {
	index: number;
	members: FellowshipMember[];
	sermonTopic: FellowshipContentField;
	setFellowship: (
		updater: (prev: ClientFellowship) => ClientFellowship,
	) => void;
	contentType: Exclude<keyof ClientFellowship['content'], 'prayerRequest'>;
};

const SermonContent = ({
	index,
	members,
	sermonTopic,
	setFellowship,
	contentType,
}: SermonContentProps) => {
	const { id, question, answers } = sermonTopic;
	const {
		handleOpen: handleOpenTopic,
		handleClose: handleCloseTopic,
		BottomSheetContainer: BottomSheetAnswerContainer,
	} = useBottomSheet();

	const [content, setContent] = useState<FellowshipContentField>({
		...sermonTopic,
		answers: [
			...answers,
			...members
				.filter(
					(member) => !answers.find((answer) => answer.member.id === member.id),
				)
				.map((member) => ({ member, value: '' })),
		],
	});
	const [selectedMember, setSelectedMember] = useState<FellowshipMember>(
		members[0],
	);
	const memberIndex = members.findIndex(
		(member) => member.id === selectedMember.id,
	);

	const handlePressSaveButton = () => {
		setFellowship((prev) => {
			const currentContentIndex = prev.content[contentType].findIndex(
				(content) => content.id === id,
			);
			const newContent = {
				...content,
				answers: content.answers.filter((answer) => answer.value !== ''),
			};
			return {
				...prev,
				content: {
					...prev.content,
					[contentType]: [
						...prev.content[contentType].slice(0, currentContentIndex),
						newContent,
						...prev.content[contentType].slice(currentContentIndex + 1),
					],
				},
			};
		});
		handleCloseTopic();
	};

	return (
		<>
			<Pressable onPress={handleOpenTopic}>
				<VStack space="md" className="bg-white rounded-xl py-4">
					<Text size="xl" className="px-4 font-pretendard-semi-bold">
						{index + 1}. {question}
					</Text>
					<VStack>
						{answers.map((answer, index) => (
							<VStack key={answer.member.id}>
								<VStack space="md" className="px-4 py-4">
									<HStack space="md" className="items-center">
										<Avatar
											key={answer.member.id}
											size="xs"
											className="bg-primary-400"
										>
											<Icon as={UserRound} size="sm" className="stroke-white" />
											<AvatarBadge className="bg-yellow-400" />
										</Avatar>
										<Text size="md">{answer.member.displayName}</Text>
									</HStack>
									<Text size="lg">{answer.value}</Text>
								</VStack>
								{index < answers.length - 1 && <Divider />}
							</VStack>
						))}
					</VStack>
				</VStack>
			</Pressable>
			<BottomSheetAnswerContainer>
				<VStack space="sm" className="px-6 py-2">
					<BottomSheetListHeader
						label={question}
						onPress={() => handleCloseTopic()}
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
									value={content.answers[memberIndex].value}
									onChangeText={(value) =>
										setContent({
											...content,
											answers: [
												...content.answers.slice(0, memberIndex),
												{ ...content.answers[memberIndex], value: value },
												...content.answers.slice(memberIndex + 1),
											],
										})
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
			</BottomSheetAnswerContainer>
		</>
	);
};

export default SermonContent;
