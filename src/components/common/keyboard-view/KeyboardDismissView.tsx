import { Keyboard, TouchableWithoutFeedback, View } from 'react-native';

const KeyboardDismissView = ({
	children,
	flexDisabled = false,
}: { children: React.ReactNode; flexDisabled?: boolean }) => {
	return (
		<TouchableWithoutFeedback onPress={Keyboard.dismiss}>
			<View className={flexDisabled ? '' : 'flex-1'}>{children}</View>
		</TouchableWithoutFeedback>
	);
};

export { KeyboardDismissView };
