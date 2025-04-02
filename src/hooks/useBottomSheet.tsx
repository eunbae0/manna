import {
	Keyboard,
	type NativeSyntheticEvent,
	Platform,
	TextInput as RNTextInput,
	type TextInputFocusEventData,
} from 'react-native';
import { FocusScope } from '@react-native-aria/focus';
import { useRef, useState, useCallback, useMemo, forwardRef } from 'react';
import type BottomSheet from '@gorhom/bottom-sheet';
import {
	BottomSheetBackdrop,
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

type Props = { onOpen?: () => void; onClose?: () => void } | undefined;

export const useBottomSheet = ({ onOpen, onClose }: Props = {}) => {
	const [visible, setVisible] = useState(false);
	// const bottomSheetRef = useRef<BottomSheet>(null);
	const insets = useSafeAreaInsets();

	// ref
	const bottomSheetModalRef = useRef<BottomSheetModal>(null);

	// callbacks
	const handlePresentModalPress = useCallback(() => {
		bottomSheetModalRef.current?.present();
	}, []);
	// const handleSheetChanges = useCallback((index: number) => {
	// 	console.log('handleSheetChanges', index);
	// }, []);

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

	const BottomSheetContainer = useCallback(
		({ children, ...props }: IBottomSheet) => (
			<BottomSheetModal
				// index={-1}
				// onChange={handleSheetChanges}
				// overDragResistanceFactor={0}
				ref={bottomSheetModalRef}
				backdropComponent={BottomSheetBackdropComponent}
				enablePanDownToClose={true}
				enableBlurKeyboardOnGesture={true}
				handleIndicatorStyle={{ backgroundColor: 'lightgray', width: 36 }}
				keyboardBehavior="interactive"
				{...props}
			>
				<KeyboardDismissView>
					<BottomSheetView
						style={{ paddingBottom: insets.bottom }}
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
