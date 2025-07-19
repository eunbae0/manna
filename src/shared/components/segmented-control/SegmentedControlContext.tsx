// SegmentedControlContext.tsx
import type React from 'react';
import { createContext, useContext, type ReactNode } from 'react';

interface SegmentedControlContextType {
	selectedValue: string;
	onValueChange?: (value: string) => void;
}

const SegmentedControlContext = createContext<
	SegmentedControlContextType | undefined
>(undefined);

interface SegmentedControlProviderProps {
	children: ReactNode;
	value: SegmentedControlContextType;
}

export const SegmentedControlProvider: React.FC<
	SegmentedControlProviderProps
> = ({ children, value }) => {
	return (
		<SegmentedControlContext.Provider value={value}>
			{children}
		</SegmentedControlContext.Provider>
	);
};

export const useSegmentedControlContext = (): SegmentedControlContextType => {
	const context = useContext(SegmentedControlContext);
	if (context === undefined) {
		throw new Error(
			'useSegmentedControlContext must be used within a SegmentedControlProvider',
		);
	}
	return context;
};
