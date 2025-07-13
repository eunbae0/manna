import {
	type KeyboardAwareScrollViewProps,
	KeyboardAwareScrollView as RNKeyboardAwareScrollView,
} from 'react-native-keyboard-controller';

const BOTTOM_OFFSET = 150;

export const KeyboardAwareScrollView = ({
	children,
	keyboardShouldPersistTaps = 'always',
	bottomOffset,
	...rest
}: KeyboardAwareScrollViewProps) => {
	return (
		<RNKeyboardAwareScrollView
			keyboardShouldPersistTaps={keyboardShouldPersistTaps}
			bottomOffset={bottomOffset || BOTTOM_OFFSET}
			disableScrollOnKeyboardHide
			{...rest}
		>
			{children}
		</RNKeyboardAwareScrollView>
	);
};
