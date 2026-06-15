import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Pressable, type PressableProps } from 'react-native';

type IconName = keyof typeof MaterialIcons.glyphMap;

interface IconNavPressableProps extends Omit<PressableProps, 'children'> {
  name: IconName;
  size?: number;
  color?: string;
}

/** Иконка в шапке: лёгкий hover (web) и active. */
export function IconNavPressable({
  name,
  size = 24,
  color = '#6B7280',
  className = '',
  ...props
}: IconNavPressableProps) {
  return (
    <Pressable
      accessibilityRole="button"
      className={`rounded-lg p-2 hover:bg-gray-200/80 active:opacity-70 dark:hover:bg-gray-600/40 ${className}`.trim()}
      {...props}
    >
      <MaterialIcons name={name} size={size} color={color} />
    </Pressable>
  );
}
