import { useNavigation } from 'expo-router';
import { useCallback, useState } from 'react';
import { useBottomSheet } from '@/hooks/useBottomSheet';
import {
	type NavigationAction,
	usePreventRemove,
} from '@react-navigation/native';
import { KeyboardController } from 'react-native-keyboard-controller';

interface UsePreventBackWithConfirmProps {
	/**
	 * 뒤로가기를 방지할지 여부를 결정하는 조건
	 */
	condition: boolean;

	/**
	 * 모달 제목
	 */
	title?: string;

	/**
	 * 모달 메시지
	 */
	message?: string;

	/**
	 * 계속 작업 버튼 텍스트
	 */
	continueText?: string;

	/**
	 * 나가기 버튼 텍스트
	 */
	exitText?: string;

	/**
	 * 나가기 확인 후 실행할 추가 콜백 (선택 사항)
	 */
	onConfirmExit?: () => void;
}

/**
 * 뒤로가기 방지 및 확인 모달을 함께 관리하는 훅
 *
 * 사용자가 뒤로가기를 시도할 때 지정된 조건에 따라 이를 방지하고
 * 확인 모달을 표시합니다.
 *
 * @description
 * 이 hook은 action.type === 'GO_BACK'일 때만 실행됩니다.
 * 따라서 action.type이 'GO_BACK'가 아닌 경우는 뒤로가기 방지 기능이 적용되지 않습니다.
 */
export function usePreventBackWithConfirm({
	condition,
	title = '작성 중인 내용이 있어요',
	message = '지금 나가면 작성 중인 내용이 모두 사라져요. 계속할까요?',
	continueText = '계속 작성하기',
	exitText = '나가기',
	onConfirmExit,
}: UsePreventBackWithConfirmProps) {
	const navigation = useNavigation();
	const [navigationAction, setNavigationAction] =
		useState<NavigationAction | null>(null);

	const {
		handleOpen: handleOpenConfirmModal,
		handleClose: handleCloseConfirmModal,
		BottomSheetContainer: ConfirmModalContainer,
		isOpen: isConfirmModalOpen,
	} = useBottomSheet({ variant: 'modal' });

	const handleExit = useCallback(async () => {
		handleCloseConfirmModal();

		setTimeout(() => {
			onConfirmExit?.();
			if (navigationAction) {
				navigation.dispatch(navigationAction);
			}
		}, 100);
	}, [handleCloseConfirmModal, onConfirmExit, navigationAction, navigation]);

	usePreventRemove(condition, async ({ data }) => {
		// GO_BACK이 아니면서 POP도 아닌 경우, 또는 POP이면서 source가 없는 경우 early return
		if (
			(data.action.type !== 'GO_BACK' && data.action.type !== 'POP') ||
			(data.action.type === 'POP' && !data.action.source)
		) {
			navigation.dispatch(data.action);
			return;
		}

		// TODO: keyboard가 visible이지만, 인식되지 않음
		if (KeyboardController.isVisible()) {
			KeyboardController.dismiss();
		}
		setNavigationAction(data.action);
		handleOpenConfirmModal();
	});

	const bottomSheetProps = {
		handleOpen: handleOpenConfirmModal,
		handleClose: handleCloseConfirmModal,
		BottomSheetContainer: ConfirmModalContainer,
		isOpen: isConfirmModalOpen,
		title,
		message,
		continueText,
		exitText,
	};

	return {
		bottomSheetProps,
		handleExit,
		isConfirmModalOpen,
		handleOpenConfirmModal,
		handleCloseConfirmModal,
	};
}
