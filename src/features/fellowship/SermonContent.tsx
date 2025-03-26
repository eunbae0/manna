import type React from 'react';
import { VStack } from '#/components/ui/vstack';
import { Pressable, ScrollView } from 'react-native';
import { Avatar } from '@/components/common/avatar';
import { Icon } from '#/components/ui/icon';
import { Divider } from '#/components/ui/divider';
import { Text } from '#/components/ui/text';
import { HStack } from '#/components/ui/hstack';
import { Plus } from 'lucide-react-native';
import { useBottomSheet } from '@/hooks/useBottomSheet';
import { Button, ButtonText } from '#/components/ui/button';
import { Textarea, TextareaInput } from '#/components/ui/textarea';
import { BottomSheetListHeader } from '@/components/common/bottom-sheet';
import { useEffect, useRef, useState } from 'react';
import type { TextInput as RNTextInput } from 'react-native';
import { cn } from '@/shared/utils/cn';
import type {
	ClientFellowship,
	FellowshipContentField,
	FellowshipMember,
} from '@/features/fellowship/api/types';
import { BottomSheetTextInput } from '@gorhom/bottom-sheet';
import { useAuthStore } from '@/store/auth';

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
		TextInput,
		isOpen,
	} = useBottomSheet();

	const { user } = useAuthStore();

	const isLeader = members.find((member) => member.isLeader) === user?.id;

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
	const [selectedMemberId, setSelectedMemberId] = useState<
		FellowshipMember['id']
	>(members[0].id);
	const memberIndex = members.findIndex(
		(member) => member.id === selectedMemberId,
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

	// auto focus
	const textInputRef = useRef<RNTextInput>();

	const handlePressMember = (memberId: FellowshipMember['id']) => {
		setSelectedMemberId(memberId);
		setTimeout(() => {
			textInputRef.current?.focus();
		}, 50);
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
										<Avatar key={answer.member.id} size="xs" />
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
									<ScrollView horizontal keyboardShouldPersistTaps="always">
										<HStack>
											{members.map((member) => (
												<Pressable
													key={member.id}
													onPress={() => handlePressMember(member.id)}
												>
													<HStack
														space="sm"
														className={cn(
															'items-center px-3 py-2',
															selectedMemberId === member.id
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
										<Icon as={Plus} size="md" className="stroke-primary-500" />
									</Pressable>
								</HStack>
								<Divider />
							</VStack>
							<BottomSheetTextInput
								ref={textInputRef}
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
