import { VStack } from '#/components/ui/vstack';
import type {
	ClientFellowship,
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
	} = useFellowship(fellowshipId);

	const fellowshipContents = fellowship?.content[contentType];

	return (
		<VStack className="gap-12" >
			{fellowshipContents?.map((content, index) => (
				<FellowshipContent
					key={content.id}
					index={index}
					contentType={contentType}
					fellowshipId={fellowshipId}
					fellowshipContent={content}
					enableReply={enableReply}
				/>
			))}
		</VStack>
	);
}
