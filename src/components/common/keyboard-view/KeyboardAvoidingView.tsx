import type { PropsWithChildren } from 'react';
import {
	KeyboardAvoidingView as RNKeyboardAvoidingView,
	Platform,
	TouchableWithoutFeedback,
	Keyboard,
	type KeyboardAvoidingViewProps,
	View,
} from 'react-native';
import { KeyboardDismissView } from './KeyboardDismissView';

const KeyboardAvoidingView = ({ children }: KeyboardAvoidingViewProps) => {
	return (
		<RNKeyboardAvoidingView
			behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
			style={{ flex: 1 }}
			keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
		>
			<KeyboardDismissView>{children}</KeyboardDismissView>
		</RNKeyboardAvoidingView>
	);
};

export { KeyboardAvoidingView };
