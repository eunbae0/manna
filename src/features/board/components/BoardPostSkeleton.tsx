import { Box } from '#/components/ui/box';
import { HStack } from '#/components/ui/hstack';
import { VStack } from '#/components/ui/vstack';

/**
 * 게시글 카드 스켈레톤 컴포넌트
 * 게시글 로딩 중에 표시되는 스켈레톤 UI
 */
export function BoardPostSkeleton() {
  return (
    <VStack space="md" className="px-4 py-4">
      {/* 상단 영역: 프로필 및 날짜 */}
      <HStack space="sm" className="items-center justify-between">
        <HStack space="sm" className="items-center">
          {/* 프로필 아바타 스켈레톤 */}
          <Box className="w-8 h-8 rounded-full bg-gray-200 animate-pulse" />
          
          {/* 작성자명 스켈레톤 */}
          <Box className="w-20 h-4 rounded-md bg-gray-200 animate-pulse" />
        </HStack>
        
        {/* 날짜 스켈레톤 */}
        <Box className="w-16 h-3 rounded-md bg-gray-200 animate-pulse" />
      </HStack>
      
      {/* 제목 스켈레톤 */}
      <Box className="w-3/4 h-6 rounded-md bg-gray-200 animate-pulse" />
      
      {/* 내용 스켈레톤 */}
      <VStack space="xs">
        <Box className="w-full h-4 rounded-md bg-gray-200 animate-pulse" />
        <Box className="w-5/6 h-4 rounded-md bg-gray-200 animate-pulse" />
        <Box className="w-2/3 h-4 rounded-md bg-gray-200 animate-pulse" />
      </VStack>
      
      {/* 하단 영역: 좋아요, 댓글 스켈레톤 */}
      <HStack space="md" className="mt-2">
        <Box className="w-16 h-4 rounded-md bg-gray-200 animate-pulse" />
        <Box className="w-16 h-4 rounded-md bg-gray-200 animate-pulse" />
      </HStack>
    </VStack>
  );
}

/**
 * 게시글 스켈레톤 리스트 컴포넌트
 * 여러 개의 스켈레톤을 표시
 */
export function BoardPostSkeletonList({ count = 3 }: { count?: number }) {
  return (
    <VStack>
      {Array.from({ length: count }).map((_, index) => (
        <Box key={index} className={index < count - 1 ? "border-b border-gray-100" : ""}>
          <BoardPostSkeleton />
        </Box>
      ))}
    </VStack>
  );
}
