import { useState } from 'react';
import {
	type SharedValue,
	useAnimatedReaction,
	runOnJS,
} from 'react-native-reanimated';

export function useSharedValueState<T>(sharedValue: SharedValue<T>): T {
	const [state, setState] = useState<T>(sharedValue.value);

	useAnimatedReaction(
		() => sharedValue.value,
		(value) => {
			runOnJS(setState)(value);
		},
	);

	return state;
}
