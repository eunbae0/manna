import { VStack } from "#/components/ui/vstack";
import Heading from "@/shared/components/heading";

import { useAuthStore } from "@/store/auth";
import { HomeUserGroupList } from "./HomeUserGroupList";
import { HomeUserGroupNotExisted } from "./HomeUserGroupNotExisted";

export function HomeMyGroupList() {
  const { user } = useAuthStore();
  const userGroups = user?.groups;

  return (
    <VStack space="xl" className="px-5 mt-3 py-1 items-center justify-center">
      <Heading size="2xl" className="w-full">나의 소그룹</Heading>
      {userGroups ?
        <HomeUserGroupList groups={userGroups} /> :
        <HomeUserGroupNotExisted />
      }
    </VStack>
  )
}