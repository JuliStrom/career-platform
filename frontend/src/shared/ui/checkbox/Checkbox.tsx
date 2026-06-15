import { Pressable, Text } from 'react-native';

interface CheckboxProps {
  value: boolean;
  onChange: (value: boolean) => void;
}

export function Checkbox({ value, onChange }: CheckboxProps) {
  return (
    <Pressable
      onPress={() => onChange(!value)}
      className="h-7 w-7 items-center justify-center  rounded border"
    >
      {value && (
        <Text className="-mt-0.5 text-2xl leading-none text-blue-600 dark:text-blue-400">
          ✓
        </Text>
      )}
    </Pressable>
  );
}
