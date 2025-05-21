import { VStack } from '#/components/ui/vstack';
import { HStack } from '#/components/ui/hstack';
import { Text } from '@/shared/components/text';
import { Icon } from '#/components/ui/icon';
import { AlertCircle } from 'lucide-react-native';
import { Button, ButtonText } from '@/components/common/button';
import { Heading } from '@/shared/components/heading';

interface ExitConfirmModalProps {
	BottomSheetContainer: React.FC<{
		children: React.ReactNode;
		snapPoints?: string[];
	}>;
	handleClose: () => void;
	onExit: () => void;
	title?: string;
	message?: string;
	continueText?: string;
	exitText?: string;
}

/**
 * 뒤로가기 확인 모달 컴포넌트
 *
 * 사용자가 뒤로가기를 시도할 때 표시되는 확인 모달입니다.
 * 작성 중인 내용이 있을 때 사용자에게 경고를 표시합니다.
 */
export function ExitConfirmModal({
	BottomSheetContainer,
	handleClose,
	onExit,
	title = '작성 중인 내용이 있어요',
	message = '지금 나가면 작성 중인 내용이 모두 사라져요. 계속할까요?',
	continueText = '계속 작성하기',
	exitText = '나가기',
}: ExitConfirmModalProps) {
	return (
		<BottomSheetContainer>
			<VStack className="items-center justify-center pt-6 pb-5 px-4 gap-10">
				<VStack className="items-center justify-center" space="lg">
					<Icon as={AlertCircle} size="xl" className="text-red-500" />
					<VStack className="items-start" space="sm">
						<Heading size="xl" className="text-start font-pretendard-bold">
							{title}
						</Heading>
						<Text size="lg" className="text-start text-typography-500">
							{message}
						</Text>
					</VStack>
				</VStack>
				<HStack className="w-full" space="sm">
					<Button
						variant="outline"
						onPress={onExit}
						fullWidth
						animation
						size="lg"
						className="flex-1"
					>
						<ButtonText>{exitText}</ButtonText>
					</Button>
					<Button
						onPress={handleClose}
						fullWidth
						animation
						size="lg"
						className="flex-1"
					>
						<ButtonText>{continueText}</ButtonText>
					</Button>
				</HStack>
			</VStack>
		</BottomSheetContainer>
	);
}
