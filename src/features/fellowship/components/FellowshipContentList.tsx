import { VStack } from '#/components/ui/vstack';
import type {
	ClientFellowship,
	ClientFellowshipContentField,
	ClientFellowshipMember,
	UpdateFellowshipInput,
} from '@/features/fellowship/api/types';
import FellowshipContent from './FellowshipContent';

type SermonContentListProps = {
	members: ClientFellowshipMember[];
	fellowshipContents: ClientFellowshipContentField[];
	updateFellowship: (updatedFellowship: UpdateFellowshipInput) => void;
	contentType: Exclude<keyof ClientFellowship['content'], 'prayerRequest'>;
	enableReply: boolean;
};

export default function FellowshipContentList({
	members,
	fellowshipContents,
	updateFellowship,
	contentType,
	enableReply,
}: SermonContentListProps) {
	const updateContent = (content: ClientFellowshipContentField) => {
		const newContents = fellowshipContents.map((topic) =>
			topic.id === content.id ? content : topic,
		);
		updateFellowship({ content: { [contentType]: newContents } });
	};

	return (
		<VStack className="gap-12">
			{fellowshipContents.map((content, index) => (
				<FellowshipContent
					key={content.id}
					index={index}
					members={members}
					fellowshipContent={content}
					updateContent={updateContent}
					enableReply={enableReply}
				/>
			))}
		</VStack>
	);
}
