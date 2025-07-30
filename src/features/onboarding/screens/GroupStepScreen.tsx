import GroupLandingScreen from '@/features/group/screens/GroupLandingScreen';
import GroupInvitedScreen from '@/features/group/screens/InvitedGroupScreen';
import { STORATE_INVITE_GROUP_CODE } from '@/hooks/useDeeplink';
import { storage } from '@/storage';

export default function GroupStepScreen() {
	const inviteCode = storage.getString(STORATE_INVITE_GROUP_CODE);

	if (inviteCode) return <GroupInvitedScreen />;

	return <GroupLandingScreen />;
}
