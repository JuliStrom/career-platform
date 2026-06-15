import 'dotenv/config';

export default ({ config }) => {
  return {
    ...config,
    extra: {
      ...config?.extra,
      apiUrlDefault: process.env.API_URL_DEFAULT,
      apiUrlAndroidEmulator: process.env.API_URL_ANDROID_EMULATOR,
      apiUrlWeb: process.env.EXPO_PUBLIC_API_URL_WEB || process.env.API_URL_WEB,
      googleClientId: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID,
      googleIosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
      googleAndroidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
      telegramBotUsername: process.env.EXPO_PUBLIC_TELEGRAM_BOT_USERNAME,
      appUrl: process.env.EXPO_PUBLIC_APP_URL,
    },
  };
};
