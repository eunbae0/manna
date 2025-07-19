import React from 'react';
import { HStack } from '#/components/ui/hstack';
import { VStack } from '#/components/ui/vstack';
import { Text } from '@/shared/components/text';
import { Avatar } from '@/components/common/avatar';
import { Icon } from '#/components/ui/icon';
import { MessageCircle, Heart, Crown } from 'lucide-react-native';
import AnimatedPressable from '@/components/common/animated-pressable';
import { formatRelativeTime } from '@/shared/utils/formatRelativeTime';
import { router } from 'expo-router';
import type { BoardPost } from '@/features/board/types';
import { shadowStyle } from '@/shared/styles/shadow';

interface HomeBoardPostCardProps {
	post: BoardPost;
}

/**
 * 홈 화면용 게시판 글 카드 컴포넌트
 * 홈 화면에서 최근 게시글을 간략하게 표시하는 카드 컴포넌트
 */
export function HomeBoardPostCard({ post }: HomeBoardPostCardProps) {
	// 게시글 카테고리에 따른 색상 설정
	const getCategoryColor = (category: string | undefined) => {
		switch (category) {
			case 'notice':
				return 'text-primary-500';
			case 'prayer':
				return 'text-blue-500';
			case 'testimony':
				return 'text-green-500';
			case 'question':
				return 'text-orange-500';
			default:
				return 'text-gray-500';
		}
	};

	// 게시글 카테고리 라벨
	const getCategoryLabel = (category: string | undefined) => {
		switch (category) {
			case 'notice':
				return '공지';
			case 'prayer':
				return '기도';
			case 'testimony':
				return '간증';
			case 'question':
				return '질문';
			default:
				return '일반';
		}
	};

	const categoryColor = getCategoryColor(post.category);
	const categoryLabel = getCategoryLabel(post.category);

	// 게시글 상세 페이지로 이동
	const handlePress = () => {
		router.push(`/(app)/(board)/${post.id}`);
	};

	return (
		<AnimatedPressable onPress={handlePress} style={shadowStyle.shadow}>
			<VStack
				space="xs"
				className="bg-gray-50 border border-gray-100 rounded-2xl p-4 pb-8 w-72"
			>
				<HStack space="sm" className="items-center">
					<Avatar
						size="sm"
						className="mt-1"
						photoUrl={post.author.photoUrl || ''}
					/>
					<HStack space="xs" className="items-center">
						<Text size="md" weight="bold">
							{post.author.displayName || '이름없음'}
						</Text>
						{post.author.role === 'leader' && (
							<Icon as={Crown} size="sm" className="text-yellow-500" />
						)}
					</HStack>
					<Text className="text-typography-500" size="sm">
						{formatRelativeTime(post.createdAt)}
					</Text>
				</HStack>

				<VStack space="xs">
					<VStack className="gap-[2px]">
						<Text size="lg" weight="bold" className="text-typography-800">
							{post.title}
						</Text>
						<Text
							size="md"
							className="text-typography-600 line-clamp-2"
							numberOfLines={1}
						>
							{post.content}
						</Text>
					</VStack>

					<HStack space="md" className="items-center mt-1">
						<HStack space="xs" className="items-center">
							<Icon as={Heart} size="sm" className="text-primary-400" />
							<Text size="sm">{post.reactionSummary?.like || 0}</Text>
						</HStack>
						<HStack space="xs" className="items-center">
							<Icon as={MessageCircle} size="sm" className="text-primary-400" />
							<Text size="sm">{post.commentCount || 0}</Text>
						</HStack>
					</HStack>
				</VStack>
			</VStack>
		</AnimatedPressable>
	);
}
