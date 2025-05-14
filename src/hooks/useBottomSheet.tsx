import {
	Keyboard,
	type LayoutChangeEvent,
	type NativeSyntheticEvent,
	Platform,
	TextInput as RNTextInput,
	type TextInputFocusEventData,
	useWindowDimensions,
} from 'react-native';
import { FocusScope } from '@react-native-aria/focus';
import { forwardRef, useCallback, useMemo, useRef, useState } from 'react';
import type BottomSheet from '@gorhom/bottom-sheet';
import {
	BottomSheetBackdrop,
	BottomSheetHandle,
	BottomSheetModal,
	BottomSheetView,
	useBottomSheetInternal,
} from '@gorhom/bottom-sheet';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { KeyboardDismissView } from '@/components/common/keyboard-view/KeyboardDismissView';
import type { BottomSheetTextInputProps } from '@gorhom/bottom-sheet/lib/typescript/components/bottomSheetTextInput';

type IBottomSheet = React.ComponentProps<typeof BottomSheet>;

const ANIMATION_DELAY = 100;

const BottomSheetBackdropComponent = (
	props: React.ComponentProps<typeof BottomSheetBackdrop>,
) => (
	<BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} />
);

const BottomSheetHandleComponent = (
	props: React.ComponentProps<typeof BottomSheetHandle>,
) => <BottomSheetHandle {...props} />;

const WebContent = ({
	visible,
	content,
}: {
	visible: boolean;
	content: React.ReactNode;
}) => (
	<FocusScope contain={visible} autoFocus={true} restoreFocus={true}>
		{content}
	</FocusScope>
);

type Props =
	| {
		variant?: 'modal' | 'bottomSheet';
		onOpen?: () => void;
		onClose?: () => void;
	}
	| undefined;

export const useBottomSheet = ({
	variant = 'bottomSheet',
	onOpen,
	onClose,
}: Props = {}) => {
	const isModal = variant === 'modal';
	const [visible, setVisible] = useState(false);
	// const bottomSheetRef = useRef<BottomSheet>(null);
	const insets = useSafeAreaInsets();

	// ref
	const bottomSheetModalRef = useRef<BottomSheetModal>(null);

	const { height: windowHeight } = useWindowDimensions();
	// 콘텐츠 높이 추정값 (모달의 일반적인 높이)
	const estimatedContentHeight = isModal ? 280 : windowHeight * 0.6;

	// 초기 bottomInset 값 계산
	const initialBottomInset = (windowHeight - estimatedContentHeight) / 2;
	const [bottomInset, setBottomInset] = useState(initialBottomInset);

	// 화면 크기가 변경되면 레더링 전에 bottomInset 재계산
	// useLayoutEffect(() => {
	// 	if (isModal) {
	// 		const newBottomInset = (windowHeight - estimatedContentHeight) / 2;
	// 		setBottomInset(newBottomInset);
	// 	}
	// }, [windowHeight, isModal, estimatedContentHeight]);

	// 모달 콘텐츠 레이아웃이 계산되면 정확한 값으로 업데이트
	const handleContentLayout = useCallback(
		({ nativeEvent: { layout } }: LayoutChangeEvent) => {
			if (isModal) {
				const calculatedInset = (windowHeight - layout.height) / 2;
				// 10px 이상 차이가 날 때만 업데이트
				if (Math.abs(calculatedInset - bottomInset) > 10) {
					setBottomInset(calculatedInset);
				}
			}
		},
		[windowHeight, bottomInset, isModal],
	);

	const handleOpen = useCallback(() => {
		setTimeout(() => {
			bottomSheetModalRef.current?.present();
		}, ANIMATION_DELAY);
		onOpen?.();
		setVisible(true);
	}, [onOpen]);

	const handleClose = useCallback(() => {
		bottomSheetModalRef.current?.close();
		onClose?.();
		Keyboard.dismiss();
		setVisible(false);
	}, [onClose]);

	// const handleSheetChanges = useCallback(
	// 	(index: number) => {
	// 		if (index === -1) handleClose();
	// 	},
	// 	[handleClose],
	// );

	const keyDownHandlers = useMemo(
		() =>
			Platform.OS === 'web'
				? {
					onKeyDown: (e: React.KeyboardEvent) => {
						if (e.key === 'Escape') {
							e.preventDefault();
							handleClose();
						}
					},
				}
				: {},
		[handleClose],
	);

	const isOpen = useMemo(() => visible, [visible]);

	// FIX: layout을 계산하고, bottomInset을 적용하면 다른 컴포넌트로 인식돼서 첫번째 ref의 동작(뒤로가기 등)이 적용되지 않음

	const BottomSheetContainer = useCallback(
		({ children, ...props }: IBottomSheet) => (
			<BottomSheetModal
				// index={-1}
				// onChange={handleSheetChanges}
				// overDragResistanceFactor={0}
				ref={bottomSheetModalRef}
				backdropComponent={BottomSheetBackdropComponent}
				enablePanDownToClose={!isModal}
				enableContentPanningGesture={false} // for Android: enable inner scroll
				enableBlurKeyboardOnGesture={true}
				handleIndicatorStyle={{
					backgroundColor: 'lightgray',
					width: 36,
				}}
				detached={isModal}
				onDismiss={onClose}
				keyboardBehavior="interactive"
				handleComponent={isModal ? null : BottomSheetHandleComponent}
				bottomInset={isModal ? bottomInset : 0}
				style={{ marginHorizontal: isModal ? 32 : 0 }}
				{...props}
			>
				<KeyboardDismissView>
					<BottomSheetView
						style={{ paddingBottom: isModal ? 0 : insets.bottom }}
						onLayout={handleContentLayout}
						{...keyDownHandlers}
					>
						{Platform.OS === 'web'
							? visible && <WebContent visible={visible} content={children} />
							: children}
					</BottomSheetView>
				</KeyboardDismissView>
			</BottomSheetModal>
		),
		[],
	);

	const TextInput = forwardRef<RNTextInput, BottomSheetTextInputProps>(
		({ onFocus, onBlur, ...rest }, ref) => {
			//#region hooks
			const { shouldHandleKeyboardEvents } = useBottomSheetInternal();
			const handleOnFocus = useCallback(
				(args: NativeSyntheticEvent<TextInputFocusEventData>) => {
					shouldHandleKeyboardEvents.value = true;
					if (onFocus) {
						onFocus(args);
					}
				},
				[onFocus, shouldHandleKeyboardEvents],
			);
			const handleOnBlur = useCallback(
				(args: NativeSyntheticEvent<TextInputFocusEventData>) => {
					shouldHandleKeyboardEvents.value = false;
					if (onBlur) {
						onBlur(args);
					}
				},
				[onBlur, shouldHandleKeyboardEvents],
			);
			return (
				<RNTextInput
					ref={ref}
					onFocus={handleOnFocus}
					onBlur={handleOnBlur}
					{...rest}
				/>
			);
		},
	);

	return {
		handleOpen,
		handleClose,
		BottomSheetContainer,
		TextInput,
		isOpen,
	};
};
