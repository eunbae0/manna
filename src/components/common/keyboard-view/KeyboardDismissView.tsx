import { Keyboard, TouchableWithoutFeedback, View } from 'react-native';

const KeyboardDismissView = ({ children }: { children: React.ReactNode }) => {
	return (
		<TouchableWithoutFeedback onPress={Keyboard.dismiss}>
			<View className="flex-1">{children}</View>
		</TouchableWithoutFeedback>
	);
};

export { KeyboardDismissView };
