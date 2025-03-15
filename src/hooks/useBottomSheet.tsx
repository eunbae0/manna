import { Platform } from 'react-native';
import { FocusScope } from '@react-native-aria/focus';
import { useRef, useState, useCallback, useMemo } from 'react';
import BottomSheet, {
	BottomSheetBackdrop,
	BottomSheetView,
} from '@gorhom/bottom-sheet';
import { Portal } from '@gorhom/portal';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

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

export const useBottomSheet = () => {
	const [visible, setVisible] = useState(false);
	const bottomSheetRef = useRef<BottomSheet>(null);
	const insets = useSafeAreaInsets();

	const handleOpen = useCallback(() => {
		setTimeout(() => {
			bottomSheetRef.current?.expand();
		}, ANIMATION_DELAY);
		setVisible(true);
	}, []);

	const handleClose = useCallback(() => {
		bottomSheetRef.current?.close();
		setVisible(false);
	}, []);

	const handleSheetChanges = useCallback(
		(index: number) => {
			if (index === -1) handleClose();
		},
		[handleClose],
	);

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

	const BottomSheetContainer = useCallback(
		({ children, ...props }: IBottomSheet) => (
			<Portal>
				<BottomSheet
					ref={bottomSheetRef}
					index={-1}
					backdropComponent={BottomSheetBackdropComponent}
					onChange={handleSheetChanges}
					overDragResistanceFactor={0}
					enablePanDownToClose={true}
					handleIndicatorStyle={{ backgroundColor: 'lightgray', width: 36 }}
					{...props}
				>
					<BottomSheetView
						style={{ paddingBottom: insets.bottom }}
						{...keyDownHandlers}
					>
						{Platform.OS === 'web'
							? visible && <WebContent visible={visible} content={children} />
							: children}
					</BottomSheetView>
				</BottomSheet>
			</Portal>
		),
		[visible, insets, keyDownHandlers, handleSheetChanges],
	);

	return {
		handleOpen,
		handleClose,
		BottomSheetContainer,
	};
};
