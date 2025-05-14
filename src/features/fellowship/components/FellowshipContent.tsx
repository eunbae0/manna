import type React from 'react';
import { VStack } from '#/components/ui/vstack';
import { Pressable } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { Avatar } from '@/components/common/avatar';
import { Divider } from '#/components/ui/divider';
import { Text } from '#/components/ui/text';
import { HStack } from '#/components/ui/hstack';
import { Edit3 } from 'lucide-react-native';
import { useBottomSheet } from '@/hooks/useBottomSheet';
import { Button, ButtonIcon, ButtonText } from '@/components/common/button';
import { BottomSheetListHeader } from '@/components/common/bottom-sheet';
import { useRef, useState } from 'react';
import type { TextInput as RNTextInput } from 'react-native';
import { cn } from '@/shared/utils/cn';
import type {
	ClientFellowshipAnswerField,
	ClientFellowshipContentField,
	ClientFellowshipMember,
} from '@/features/fellowship/api/types';
import { BottomSheetTextInput } from '@gorhom/bottom-sheet';
import { TEXT_INPUT_STYLE } from '@/components/common/text-input';
import AnimatedPressable from '@/components/common/animated-pressable';
import { openProfile } from '@/shared/utils/router';

type SermonContentItemProps = {
	index?: number;
	members: ClientFellowshipMember[];
	fellowshipContent: ClientFellowshipContentField;
	updateContent: (answer: ClientFellowshipContentField) => void;
	enableReply: boolean;
};

export default function FellowshipContent({
	index,
	members,
	fellowshipContent,
	updateContent,
	enableReply,
}: SermonContentItemProps) {
	const { id, question, answers: existedAnswers } = fellowshipContent;
	const {
		handleOpen: handleOpenTopic,
		handleClose: handleCloseTopic,
		BottomSheetContainer: BottomSheetAnswerContainer,
	} = useBottomSheet();

	const initialContent = [
		...members.map((member, index) => {
			const existedAnswer = existedAnswers.find(
				(answer) => answer.member.id === member.id,
			);
			const value = existedAnswer?.value || '';

			if (index === 0) {
				return { member, value, selected: true };
			}
			return { member, value, selected: false };
		}),
	];

	const [answers, setAnswers] =
		useState<(ClientFellowshipAnswerField & { selected: boolean })[]>(
			initialContent,
		);

	const selectedAnswer = answers.find((answer) => answer.selected);

	const handlePressSaveButton = () => {
		const newContent = {
			id,
			question,
			answers: answers
				.filter((answer) => answer.value !== '')
				.map(({ selected, ...rest }) => rest),
		} satisfies ClientFellowshipContentField;
		updateContent(newContent);

		handleCloseTopic();
	};

	// useEffect(() => {
	// 	setAnswers(initialContent);
	// }, [fellowshipContent]);

	// auto focus
	const textInputRef = useRef<RNTextInput>();

	const handlePressMember = (memberId: ClientFellowshipMember['id']) => {
		setAnswers((prev) =>
			prev.map((answer) =>
				answer.member.id === memberId
					? { ...answer, selected: true }
					: { ...answer, selected: false },
			),
		);
		setTimeout(() => {
			textInputRef.current?.focus();
		}, 50);
	};

	return (
		<>
			<VStack space="2xl" className="">
				<HStack className="ml-2 items-center justify-between">
					<Text size="xl" className="font-pretendard-semi-bold flex-1 mr-2">
						{index !== undefined && `${index + 1}. `}
						{question}
					</Text>
					{enableReply && (
						<Button variant="icon" onPress={handleOpenTopic}>
							<ButtonIcon as={Edit3} />
						</Button>
					)}
				</HStack>
				<VStack space="xl" className="pl-4">
					{existedAnswers.map((answer) => (
						<VStack key={answer.member.id}>
							<VStack space="sm">
								<AnimatedPressable
									onPress={() =>
										!answer.member.isGuest && openProfile(answer.member.id)
									}
								>
									<HStack space="sm" className="items-center">
										<Avatar
											size="2xs"
											photoUrl={answer.member.photoUrl || undefined}
										/>
										<Text
											size="md"
											className="font-pretendard-bold text-typography-600"
										>
											{answer.member.displayName}
										</Text>
									</HStack>
								</AnimatedPressable>
								<Text size="lg" className="flex-1 mx-1">
									{answer.value}
								</Text>
							</VStack>
						</VStack>
					))}
				</VStack>
			</VStack>

			{/* bottom sheet */}
			<BottomSheetAnswerContainer>
				<VStack space="sm" className="px-6 py-2">
					<BottomSheetListHeader
						label="나눔 답변 작성하기"
						onPress={() => handleCloseTopic()}
					/>
					<VStack className="gap-14">
						<VStack space="2xl">
							<Text
								size="xl"
								className="font-pretendard-semi-bold p-4 border border-background-400 rounded-xl"
							>
								{index !== undefined && `${index + 1}. `}
								{question}
							</Text>

							<VStack>
								<HStack className="items-center justify-between">
									<ScrollView horizontal keyboardShouldPersistTaps="always">
										<HStack>
											{answers.map((answer) => (
												<Pressable
													key={answer.member.id}
													onPress={() => handlePressMember(answer.member.id)}
												>
													<HStack
														space="sm"
														className={cn(
															'items-center px-3 py-2',
															answer.selected
																? 'border-b-2 border-primary-500'
																: 'text-typography-700',
														)}
													>
														<Avatar
															size="xs"
															photoUrl={answer.member.photoUrl || undefined}
														/>
														<Text size="md">{answer.member.displayName}</Text>
													</HStack>
												</Pressable>
											))}
										</HStack>
									</ScrollView>
									{/* <Pressable className="p-2">
										<Icon as={Plus} size="md" className="stroke-primary-500" />
									</Pressable> */}
								</HStack>
								<Divider />
							</VStack>
							<BottomSheetTextInput
								// @ts-ignore
								ref={textInputRef}
								defaultValue={selectedAnswer?.value || ''}
								onChangeText={(value) =>
									setAnswers((prev) =>
										prev.map((answer) =>
											answer.selected ? { ...answer, value } : answer,
										),
									)
								}
								multiline
								placeholder="나눔을 입력해주세요..."
								className={TEXT_INPUT_STYLE}
							/>
						</VStack>
						<Button size="lg" rounded onPress={handlePressSaveButton}>
							<ButtonText>저장하기</ButtonText>
						</Button>
					</VStack>
				</VStack>
			</BottomSheetAnswerContainer>
		</>
	);
}
