import { LanguageSwitcher } from '@/shared/ui/LanguageSwitcher';
import { Image, View } from 'react-native';

const logo = require('../../../../assets/images/logo.png');

export function AppHeader() {
  return (
    <View className="w-full flex-row items-center justify-between border-b border-hairline bg-header px-4 py-3 dark:border-hairline-dark dark:bg-header-dark">
      <View className="overflow-hidden rounded-5xl">
        <Image
          source={logo}
          resizeMode="contain"
          style={{ width: 180, height: 54 }}
          accessibilityLabel="Career Platform"
        />
      </View>
      <LanguageSwitcher />
    </View>
  );
}
