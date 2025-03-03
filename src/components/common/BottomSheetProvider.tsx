import { Platform } from 'react-native';
import { FocusScope } from '@react-native-aria/focus';
import {
	createContext,
	useRef,
	useState,
	useCallback,
	useContext,
	type PropsWithChildren,
	useMemo,
} from 'react';
import BottomSheet, {
	BottomSheetBackdrop,
	BottomSheetView,
} from '@gorhom/bottom-sheet';

type IBottomSheet = React.ComponentProps<typeof BottomSheet>;
type BottomSheetContextType = {
	visible: boolean;
	bottomSheetRef: React.RefObject<BottomSheet>;
	handleClose: () => void;
	handleOpen: (
		component: React.ReactNode,
		customProps?: Omit<IBottomSheet, 'children'>,
	) => void;
};

const DEFAULT_CONTEXT: BottomSheetContextType = {
	visible: false,
	bottomSheetRef: { current: null },
	handleClose: () => {},
	handleOpen: () => {},
};

const DEFAULT_SNAP_POINTS = [50];
const ANIMATION_DELAY = 100;

const BottomSheetContext =
	createContext<BottomSheetContextType>(DEFAULT_CONTEXT);

const BottomSheetBackdropComponent = (
	props: React.ComponentProps<typeof BottomSheetBackdrop>,
) => (
	<BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={1} />
);

const WebContent = ({
	visible,
	content,
}: { visible: boolean; content: React.ReactNode }) => (
	<FocusScope contain={visible} autoFocus={true} restoreFocus={true}>
		{content}
	</FocusScope>
);

export const BottomSheetProvider = ({ children }: PropsWithChildren) => {
	const [content, setContent] = useState<React.ReactNode>(null);
	const [props, setProps] = useState<Omit<IBottomSheet, 'children'>>({});
	const [visible, setVisible] = useState(false);
	const bottomSheetRef = useRef<BottomSheet>(null);

	const handleOpen = useCallback(
		(
			component: React.ReactNode,
			customProps?: Omit<IBottomSheet, 'children'>,
		) => {
			setContent(component);
			setProps(customProps || {});
			setTimeout(() => {
				bottomSheetRef.current?.snapToIndex(1);
			}, ANIMATION_DELAY);
			setVisible(true);
		},
		[],
	);

	const handleClose = useCallback(() => {
		bottomSheetRef.current?.close();
		setVisible(false);
	}, []);

	const handleSheetChanges = useCallback(
		(index: number) => {
			if (index <= 0) handleClose();
		},
		[handleClose],
	);

	const keyDownHandlers = useMemo(() => {
		if (Platform.OS !== 'web') return {};

		return {
			onKeyDown: (e: React.KeyboardEvent) => {
				if (e.key === 'Escape') {
					e.preventDefault();
					handleClose();
				}
			},
		};
	}, [handleClose]);

	const contextValue = useMemo(
		() => ({
			visible,
			bottomSheetRef,
			handleClose,
			handleOpen,
		}),
		[visible, handleClose, handleOpen],
	);

	return (
		<BottomSheetContext.Provider value={contextValue}>
			{children}
			<BottomSheet
				ref={bottomSheetRef}
				snapPoints={props.snapPoints || DEFAULT_SNAP_POINTS}
				index={-1}
				backdropComponent={BottomSheetBackdropComponent}
				onChange={handleSheetChanges}
				enablePanDownToClose={true}
				{...props}
			>
				<BottomSheetView {...keyDownHandlers}>
					{Platform.OS === 'web'
						? visible && <WebContent visible={visible} content={content} />
						: content}
				</BottomSheetView>
			</BottomSheet>
		</BottomSheetContext.Provider>
	);
};

export const useBottomSheet = () => useContext(BottomSheetContext);
