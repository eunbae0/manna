import { Platform, type KeyboardAvoidingViewProps } from 'react-native';
import { KeyboardDismissView } from './KeyboardDismissView';
import { KeyboardAvoidingView as RNKeyboardAvoidingView } from 'react-native-keyboard-controller';

const KeyboardAvoidingView = ({
	children,
	keyboardVerticalOffset,
}: Omit<KeyboardAvoidingViewProps, 'behavior'>) => {
	return (
		<RNKeyboardAvoidingView
			behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
			style={{ flex: 1 }}
			keyboardVerticalOffset={
				Platform.OS === 'ios' ? keyboardVerticalOffset ?? 12 : 0
			}
		>
			<KeyboardDismissView>{children}</KeyboardDismissView>
		</RNKeyboardAvoidingView>
	);
};

export { KeyboardAvoidingView };
