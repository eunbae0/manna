import { Divider } from '#/components/ui/divider';
import { VStack } from '#/components/ui/vstack';
import type { ClientPrayerRequest, Member } from '@/api/prayer-request/types';
import { PrayerRequestCard } from '@/features/prayer-request/components/PrayerRequestCard';
import { Text } from '#/components/ui/text';
import type { YYYYMMDD } from '@/shared/types/date';

export default function PreayerRequestList({
	prayerRequests,
	member,
	selectedDate,
	isError,
}: {
	prayerRequests: ClientPrayerRequest[] | undefined;
	member: Member;
	selectedDate: YYYYMMDD;
	isError: boolean;
}) {
	if (isError) {
		return (
			<Text className="text-center py-8 text-danger-500">
				기도 제목을 불러오는 중 오류가 발생했어요
			</Text>
		);
	}
	if (!prayerRequests || prayerRequests.length === 0) {
		return (
			<Text className="text-center py-8 text-gray-500">기도 제목이 없어요</Text>
		);
	}
	return (
		<VStack>
			{prayerRequests.map((prayerRequest: ClientPrayerRequest, index) => (
				<VStack key={prayerRequest.id}>
					{index > 0 && <Divider className="bg-background-100 h-[1px] px-4" />}
					<PrayerRequestCard
						prayerRequest={prayerRequest}
						member={member}
						selectedDate={selectedDate}
					/>
				</VStack>
			))}
		</VStack>
	);
}
