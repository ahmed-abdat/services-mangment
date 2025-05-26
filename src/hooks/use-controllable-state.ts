import * as React from "react";

export interface UseControllableStateProps<T> {
  prop?: T;
  defaultProp?: T;
  onChange?: (state: T) => void;
}

/**
 * A hook that manages both controlled and uncontrolled component states.
 * Useful for creating components that can be used both as controlled or uncontrolled.
 */
export function useControllableState<T>({
  prop,
  defaultProp,
  onChange = () => {},
}: UseControllableStateProps<T>) {
  const [uncontrolledProp, setUncontrolledProp] = React.useState(defaultProp);
  const isControlled = prop !== undefined;
  const value = isControlled ? prop : uncontrolledProp;

  const handleChange = React.useCallback(
    (nextValue: T) => {
      if (!isControlled) {
        setUncontrolledProp(nextValue);
      }
      onChange(nextValue);
    },
    [isControlled, onChange]
  );

  return [value, handleChange] as const;
}
