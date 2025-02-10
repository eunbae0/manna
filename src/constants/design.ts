export type ColorNumber =
	| '100'
	| '150'
	| '200'
	| '250'
	| '300'
	| '350'
	| '400'
	| '450'
	| '500'
	| '550'
	| '600'
	| '650'
	| '700'
	| '750'
	| '800'
	| '850'
	| '900';
export type ColorsKey = 'neutral' | 'primary';

export type Colors = `${ColorsKey}-${ColorNumber}`;

export type Size = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type ButtonVariant = 'solid' | 'outlined' | 'transparent' | 'link';
export type ButtonState = 'default' | 'disabled';
export type IconLocation = 'left' | 'right';
