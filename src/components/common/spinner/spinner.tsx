import React from 'react';
import { ActivityIndicator, type ActivityIndicatorProps } from 'react-native';

interface SpinnerProps extends ActivityIndicatorProps {
	size?: 'small' | 'large';
	color?: string;
	className?: string;
}

const Spinner = (props: SpinnerProps) => {
	const { size = 'small', color = '#4F46E5', className, ...rest } = props;

	return (
		<ActivityIndicator
			size={size}
			color={color}
			className={className}
			{...rest}
		/>
	);
};

export { Spinner };
