import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
	DefaultKeyboardToolbarTheme,
	KeyboardToolbar as RNKeyboardToolbar,
	type KeyboardToolbarProps as RNKeyboardToolbarProps,
} from 'react-native-keyboard-controller';
import * as Haptics from 'expo-haptics';

export interface KeyboardToolbarProps
	extends Omit<RNKeyboardToolbarProps, 'insets'> {
	/**
	 * Text to display on the done button
	 * @default "완료"
	 */
	doneText?: string;
	/**
	 * Optional insets to override the default safe area insets
	 */
	insets?: RNKeyboardToolbarProps['insets'];
}

const haptic = () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

const theme: KeyboardToolbarProps['theme'] = {
	...DefaultKeyboardToolbarTheme,
	light: {
		...DefaultKeyboardToolbarTheme.light,
		primary: '#362303',
	},
	dark: {
		...DefaultKeyboardToolbarTheme.dark,
		primary: '#362303',
	},
};

/**
 * A keyboard toolbar component that displays a "done" button above the keyboard
 * to dismiss it. Uses react-native-keyboard-controller under the hood.
 */
export function KeyboardToolbar({
	doneText = '완료',
	insets: customInsets,
	...rest
}: KeyboardToolbarProps) {
	const defaultInsets = useSafeAreaInsets();
	const insets = customInsets || defaultInsets;

	return (
		<RNKeyboardToolbar
			doneText={doneText}
			insets={insets}
			onDoneCallback={haptic}
			theme={theme}
			{...rest}
		/>
	);
}
