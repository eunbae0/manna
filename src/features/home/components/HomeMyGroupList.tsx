import { VStack } from '#/components/ui/vstack';
import Heading from '@/shared/components/heading';

import { useAuthStore } from '@/store/auth';
import { HomeUserGroupList } from './HomeUserGroupList';
import { HomeUserGroupNotExisted } from './HomeUserGroupNotExisted';

export function HomeMyGroupList() {
	const { user } = useAuthStore();
	const userGroups = user?.groups ?? [];
	const isUserHasGroup = user?.groups ? user.groups.length > 0 : false;

	return (
		<VStack space="xl" className="px-5 mt-5 py-1 items-center justify-center">
			<Heading size="2xl" className="w-full">
				나의 소그룹
			</Heading>
			{isUserHasGroup ? (
				<HomeUserGroupList groups={userGroups} />
			) : (
				<HomeUserGroupNotExisted />
			)}
		</VStack>
	);
}
