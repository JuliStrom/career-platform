import * as SecureStore from 'expo-secure-store';

const TOKEN_KEYS = {
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
} as const;

/**
 * Безопасное хранение токенов аутентификации
 * Использует expo-secure-store для шифрования данных
 */
export const secureStorage = {
  /**
   * Сохранить access token
   */
  async setAccessToken(token: string): Promise<void> {
    try {
      await SecureStore.setItemAsync(TOKEN_KEYS.ACCESS_TOKEN, token);
    } catch (error) {
      console.error('Failed to save access token:', error);
      throw new Error('Не удалось сохранить токен доступа');
    }
  },

  /**
   * Получить access token
   */
  async getAccessToken(): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(TOKEN_KEYS.ACCESS_TOKEN);
    } catch (error) {
      console.error('Failed to get access token:', error);
      return null;
    }
  },

  /**
   * Сохранить refresh token
   */
  async setRefreshToken(token: string): Promise<void> {
    try {
      await SecureStore.setItemAsync(TOKEN_KEYS.REFRESH_TOKEN, token);
    } catch (error) {
      console.error('Failed to save refresh token:', error);
      throw new Error('Не удалось сохранить refresh токен');
    }
  },

  /**
   * Получить refresh token
   */
  async getRefreshToken(): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(TOKEN_KEYS.REFRESH_TOKEN);
    } catch (error) {
      console.error('Failed to get refresh token:', error);
      return null;
    }
  },

  /**
   * Удалить access token
   */
  async removeAccessToken(): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(TOKEN_KEYS.ACCESS_TOKEN);
    } catch (error) {
      console.error('Failed to remove access token:', error);
    }
  },

  /**
   * Удалить refresh token
   */
  async removeRefreshToken(): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(TOKEN_KEYS.REFRESH_TOKEN);
    } catch (error) {
      console.error('Failed to remove refresh token:', error);
    }
  },

  /**
   * Удалить все токены
   */
  async clearTokens(): Promise<void> {
    try {
      await Promise.all([
        SecureStore.deleteItemAsync(TOKEN_KEYS.ACCESS_TOKEN),
        SecureStore.deleteItemAsync(TOKEN_KEYS.REFRESH_TOKEN),
      ]);
    } catch (error) {
      console.error('Failed to clear tokens:', error);
    }
  },
};
