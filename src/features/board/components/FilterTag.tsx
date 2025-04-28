import { Box } from '#/components/ui/box';
import { Text } from '#/components/ui/text';
import AnimatedPressable from '@/components/common/animated-pressable';
import { cn } from '@/shared/utils/cn';

interface FilterTagProps {
	label: string;
	isSelected: boolean;
	onPress: () => void;
}

/**
 * 필터 태그 컴포넌트
 * 게시판 카테고리 필터링에 사용되는 태그 컴포넌트
 */
export function FilterTag({ label, isSelected, onPress }: FilterTagProps) {
	return (
		<AnimatedPressable onPress={onPress}>
			<Box
				className={cn('px-3 py-1.5 rounded-full mr-2', {
					'bg-primary-500': isSelected,
					'bg-gray-200': !isSelected,
				})}
			>
				<Text
					className={cn('text-sm font-pretendard-medium', {
						'text-white': isSelected,
						'text-gray-700': !isSelected,
					})}
				>
					{label}
				</Text>
			</Box>
		</AnimatedPressable>
	);
}
