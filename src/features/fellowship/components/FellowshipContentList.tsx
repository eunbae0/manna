import { VStack } from '#/components/ui/vstack';
import type {
	ClientFellowship,
	FellowshipContentField,
	FellowshipMember,
	UpdateFellowshipInput,
} from '@/features/fellowship/api/types';
import FellowshipContent from './FellowshipContent';

type SermonContentListProps = {
	members: FellowshipMember[];
	fellowshipContents: FellowshipContentField[];
	updateFellowship: (updatedFellowship: UpdateFellowshipInput) => void;
	contentType: Exclude<keyof ClientFellowship['content'], 'prayerRequest'>;
	isLeader: boolean;
};

export default function FellowshipContentList({
	members,
	fellowshipContents,
	updateFellowship,
	contentType,
	isLeader,
}: SermonContentListProps) {
	const updateContent = (content: FellowshipContentField) => {
		const newContents = fellowshipContents.map((topic) =>
			topic.id === content.id ? content : topic,
		);
		updateFellowship({ content: { [contentType]: newContents } });
	};

	return (
		<VStack space="3xl">
			{fellowshipContents.map((content, index) => (
				<FellowshipContent
					key={content.id}
					index={index}
					members={members}
					fellowshipContent={content}
					updateContent={updateContent}
					isLeader={isLeader}
				/>
			))}
		</VStack>
	);
}
