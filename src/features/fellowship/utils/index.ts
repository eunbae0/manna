import type { GroupMember } from '@/api/group/types';
import type { ClientFellowshipV2 } from '../api/types';

// utils/fellowship.ts
export function getFellowshipContentTitleList(
	content: ClientFellowshipV2['content'],
) {
	return Object.values(content.categories)
		.filter(
			(category) =>
				category.isActive &&
				Object.values(Object.values(category.items)[0]?.answers || {}).length >
					0,
		)
		.map((category) => ({
			id: category.id,
			title: category.title,
			items: category.items,
		}));
}

export function getFellowshipContentItemList(
	fellowshipContentTitleList: Array<{
		id: string;
		title: string;
		items: ClientFellowshipV2['content']['categories'][string]['items'];
	}>,
	findMemberInfo: (
		id: string,
	) => GroupMember | { id: string; displayName: string },
) {
	return fellowshipContentTitleList.map((content) => ({
		id: content.id,
		content: Object.entries(
			Object.values(content.items).sort((a, b) => a.order - b.order)[0]
				?.answers || {},
		).map(([memberId, answer]) => ({
			member: findMemberInfo(memberId),
			answer,
		})),
	}));
}

export function getCompactFellowshipContents(
	content: ClientFellowshipV2['content'],
	findMemberInfo: (
		id: string,
	) => GroupMember | { id: string; displayName: string; photoUrl?: string },
) {
	return Object.values(content.categories)
		.filter(
			(category) =>
				category.isActive &&
				Object.values(Object.values(category.items)[0]?.answers || {}).length >
					0,
		)
		.map((category) => {
			const items = Object.values(category.items);
			const randomAnswers = items
				.map((item) => {
					const answerEntries = Object.entries(item.answers || {});
					if (answerEntries.length === 0) return null;
					const randomIdx = Math.floor(Math.random() * answerEntries.length);
					const [memberId, answer] = answerEntries[randomIdx];
					return {
						member: findMemberInfo(memberId),
						answer,
					};
				})
				.filter(Boolean); // null 제거
			return {
				id: category.id,
				title: category.title,
				content: randomAnswers[0],
			};
		});
}

export function generateRandomSliceRange(length: number) {
	if (length <= 1) return [0, length];
	const randomIndex = Math.floor(Math.random() * (length - 1));
	const endIndex = Math.min(randomIndex + 2, length);
	return [randomIndex, endIndex];
}
