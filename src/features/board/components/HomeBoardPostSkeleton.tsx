import React from 'react';
import { Box } from '#/components/ui/box';
import { HStack } from '#/components/ui/hstack';
import { VStack } from '#/components/ui/vstack';
import { shadowStyle } from '@/shared/styles/shadow';

/**
 * 홈 화면용 게시글 카드 스켈레톤 컴포넌트
 * 홈 화면에서 게시글 로딩 중에 표시되는 스켈레톤 UI
 */
export function HomeBoardPostSkeleton() {
	return (
		<VStack
			space="xs"
			className="bg-background-50 rounded-2xl p-4 pb-12 w-72"
			style={shadowStyle.shadow}
		>
			{/* 작성자 정보 영역 */}
			<HStack space="sm" className="items-center">
				{/* 프로필 아바타 스켈레톤 */}
				<Box className="w-6 h-6 rounded-full bg-gray-200 animate-pulse mt-1" />

				{/* 작성자 이름 스켈레톤 */}
				<HStack space="xs" className="items-center">
					<Box className="w-20 h-5 rounded-md bg-gray-200 animate-pulse" />
				</HStack>

				{/* 시간 스켈레톤 */}
				<Box className="w-16 h-4 rounded-md bg-gray-200 animate-pulse" />
			</HStack>

			<VStack space="xs">
				<VStack className="gap-[2px]">
					{/* 게시글 제목 스켈레톤 */}
					<Box className="w-4/5 h-6 rounded-md bg-gray-200 animate-pulse" />

					{/* 게시글 내용 스켈레톤 */}
					<Box className="w-full h-4 rounded-md bg-gray-200 animate-pulse" />
				</VStack>

				{/* 좋아요, 댓글 수 스켈레톤 */}
				<HStack space="md" className="items-center mt-1">
					<Box className="w-12 h-4 rounded-md bg-gray-200 animate-pulse" />
					<Box className="w-12 h-4 rounded-md bg-gray-200 animate-pulse" />
				</HStack>
			</VStack>
		</VStack>
	);
}
