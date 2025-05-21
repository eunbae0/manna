import {
	Keyboard,
	TouchableWithoutFeedback,
	View,
	type ViewProps,
} from 'react-native';

const KeyboardDismissView = ({
	children,
	flexDisabled = false,
	...props
}: {
	children: React.ReactNode;
	flexDisabled?: boolean;
} & ViewProps) => {
	return (
		<TouchableWithoutFeedback onPress={Keyboard.dismiss} {...props}>
			<View className={flexDisabled ? '' : 'flex-1'}>{children}</View>
		</TouchableWithoutFeedback>
	);
};

export { KeyboardDismissView };
