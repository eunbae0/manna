import React from 'react';
import { type TextInputProps, TextInput } from 'react-native';
import type { Size } from '@/constants/design';

type TInputProps = { size?: Size } & TextInputProps;

function TInput({ size = 'md', ...props }: TInputProps) {
	return <TextInput {...props} />;
}

export default TInput;
