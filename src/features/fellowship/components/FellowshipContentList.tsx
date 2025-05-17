import { VStack } from '#/components/ui/vstack';
import type {
	ClientFellowship,
	ClientFellowshipContentField,
	ClientFellowshipMember,
	UpdateFellowshipInput,
} from '@/features/fellowship/api/types';
import FellowshipContent from './FellowshipContent';
import { useFellowship } from '../hooks/useFellowship';

type SermonContentListProps = {
	fellowshipId: string;
	contentType: Exclude<keyof ClientFellowship['content'], 'prayerRequest'>;
	enableReply: boolean;
};

export default function FellowshipContentList({
	fellowshipId,
	contentType,
	enableReply,
}: SermonContentListProps) {
	const {
		fellowship,
		updateFellowship,
	} = useFellowship(fellowshipId);

	const fellowshipContents = fellowship?.content[contentType];

	const updateContent = (content: ClientFellowshipContentField) => {
		const newContents = fellowshipContents?.map((topic) =>
			topic.id === content.id ? content : topic,
		);
		updateFellowship({ content: { [contentType]: newContents } });
	};

	return (
		<VStack className="gap-12">
			{fellowshipContents?.map((content, index) => (
				<FellowshipContent
					key={content.id}
					index={index}
					fellowshipId={fellowshipId}
					fellowshipContent={content}
					updateContent={updateContent}
					enableReply={enableReply}
				/>
			))}
		</VStack>
	);
}
