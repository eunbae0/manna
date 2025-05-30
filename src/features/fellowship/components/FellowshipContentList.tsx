import { VStack } from '#/components/ui/vstack';
import type {
	ClientFellowship,
} from '@/features/fellowship/api/types';
import FellowshipContent from './FellowshipContent';
import { useFellowship } from '../hooks/useFellowship';

type SermonContentListProps = {
	fellowshipId: string;
	contentType: keyof ClientFellowship['content'];
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

	const fellowshipContents = Object.values(fellowship?.content.categories[contentType]?.items || {});

	return (
		<VStack space="md" >
			{fellowshipContents?.map((content) => (
				<FellowshipContent
					key={content.id}
					fellowshipId={fellowshipId}
					contentType={contentType}
					fellowshipContent={content}
					enableReply={enableReply}
				/>
			))}
		</VStack>
	);
}
