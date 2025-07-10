import { useState, type ReactNode } from 'react';
import { SegmentedControlProvider } from './SegmentedControlContext';
import { HStack } from '#/components/ui/hstack';
import type { ViewProps } from 'react-native';
import { cn } from '@/shared/utils/cn';

type SegmentedControlProps = {
  children: ReactNode;
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string | number) => void;
} & ViewProps;

const SegmentedControl = ({
  children,
  defaultValue,
  value,
  onValueChange,
  className,
  ...props
}: SegmentedControlProps) => {
  const [selectedValue, setSelectedValue] = useState<string>(
    value ?? defaultValue ?? '',
  );
  const isControlled = value !== undefined;

  const handleValueChange = (newValue: string) => {
    if (!isControlled) {
      setSelectedValue(newValue);
    }
    onValueChange?.(newValue);
  };

  const contextValue = {
    selectedValue: isControlled ? value : selectedValue,
    onValueChange: handleValueChange,
  };

  return (
    <SegmentedControlProvider value={contextValue}>
      <HStack className={cn("bg-background-100 rounded-xl border-2 border-background-200/40", className)} {...props}>
        {children}
      </HStack>
    </SegmentedControlProvider>
  );
};

export default SegmentedControl;
