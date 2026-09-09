import { LanguageSwitcher } from '@/shared/ui/LanguageSwitcher';
import { Image, useColorScheme, View } from 'react-native';

const logoLight = require('../../../../assets/images/logo.png');
const logoDark = require('../../../../assets/images/logo-dark.png');

export function AppHeader() {
  const colorScheme = useColorScheme();

  return (
    <View className="w-full flex-row flex-wrap items-center justify-between gap-3 border-b border-hairline bg-header px-4 py-3 dark:border-hairline-dark dark:bg-header-dark">
      <Image
        source={colorScheme === 'dark' ? logoDark : logoLight}
        resizeMode="contain"
        style={{ width: 180, height: 54 }}
        accessibilityLabel="Career Platform"
      />
      <LanguageSwitcher />
    </View>
  );
}
