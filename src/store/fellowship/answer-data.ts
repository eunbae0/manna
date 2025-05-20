import { create } from 'zustand';
import type {
	ClientFellowshipMember,
	ClientFellowshipAnswerField,
	ClientFellowshipContentField,
	ClientFellowshipPrayerRequestField,
} from '@/features/fellowship/api/types';

interface AnswerDataState {
	answers: ClientFellowshipAnswerField[];
	contentId?: string;
	question?: string;
	contentType?: 'iceBreaking' | 'sermonTopic' | 'prayerRequest';

	setInitialData: ({
		members,
		existingContent,
		existingPrayerRequestAnswers,
		contentType,
	}: {
		members: ClientFellowshipMember[];
		existingContent?: ClientFellowshipContentField;
		existingPrayerRequestAnswers?: ClientFellowshipAnswerField[];
		contentType: 'iceBreaking' | 'sermonTopic' | 'prayerRequest';
	}) => void;
	updateAnswer: (memberId: string, value: string) => void;
	getFilteredAnswers: () => ClientFellowshipAnswerField[];
	reset: () => void;
}

export const useAnswerDataStore = create<AnswerDataState>((set, get) => ({
	answers: [],
	contentId: undefined,
	question: undefined,
	contentType: undefined,

	setInitialData: ({
		members,
		existingContent,
		existingPrayerRequestAnswers,
		contentType,
	}: {
		members: ClientFellowshipMember[];
		existingContent?: ClientFellowshipContentField;
		existingPrayerRequestAnswers?: ClientFellowshipAnswerField[];
		contentType: 'iceBreaking' | 'sermonTopic' | 'prayerRequest';
	}) => {
		const initialAnswers =
			contentType === 'prayerRequest'
				? existingPrayerRequestAnswers
				: members.map((member) => {
						const existedAnswer = existingContent?.answers.find(
							(answer) => answer.member.id === member.id,
						);
						return {
							member,
							value: existedAnswer?.value || '',
						};
					});

		console.log(initialAnswers);

		set({
			answers: initialAnswers,
			contentId: existingContent?.id,
			question: existingContent?.question,
			contentType,
		});
	},

	updateAnswer: (memberId, value) => {
		set((state) => ({
			answers: state.answers.map((answer) =>
				answer.member.id === memberId ? { ...answer, value } : answer,
			),
		}));
	},

	getFilteredAnswers: () => {
		return get()
			.answers.filter((answer) => answer.value !== '')
			.map(({ member, value }) => ({
				member,
				value: value.trim(),
			}));
	},

	reset: () => {
		set({
			answers: [],
			contentId: undefined,
			question: undefined,
			contentType: undefined,
		});
	},
}));
