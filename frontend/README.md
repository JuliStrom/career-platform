# Career App (Frontend)

Мобильное приложение карьерной платформы. Регистрация по email или по invite-коду. Профиль, вакансии, карьерные рекомендации. Вход через email, Google (web, iOS, Android) и Telegram (web).

## Технологии

| Технология | Версия | Назначение |
|------------|--------|------------|
| **React Native** | 0.81 | Кроссплатформенная разработка |
| **Expo** | ~54 | Платформа и тулчейн |
| **Expo Router** | ~6 | Файловая маршрутизация |
| **TypeScript** | 5.9 | Типизация |
| **NativeWind** | 4.x | Tailwind CSS для RN |
| **Zustand** | 5.x | Состояние |
| **Zod** | 4.x | Валидация |
| **i18next** | 25.x | Интернационализация (ru/en) |
| **React Hook Form** | 7.x | Формы |
| **Axios** | 1.x | HTTP клиент |
| **expo-auth-session** | 7.x | Google OAuth (iOS, Android) |

## Требования

- **Node.js** 18+
- **npm** или **yarn**
- Для iOS: Expo Go (или Xcode на macOS)
- Для Android: Expo Go или Android Studio

## Установка и запуск

### 1. Установка

```bash
cd career-platform-app/frontend
npm install
```

### 2. Переменные окружения

Скопируйте `.env.example` в `.env` и заполните:

```bash
cp .env.example .env
```

Обязательные: `API_URL_WEB`, `API_URL_DEFAULT` (IP вашего ПК для iOS/Android). OAuth: `EXPO_PUBLIC_GOOGLE_CLIENT_ID`, `EXPO_PUBLIC_TELEGRAM_BOT_USERNAME`, `EXPO_PUBLIC_APP_URL`.

**Важно:** `API_URL_WEB` / `EXPO_PUBLIC_API_URL_WEB` должны указывать на **корень API** с суффиксом `/api`, например `https://ваш-backend.railway.app/api`. Не подставляйте путь страницы фронта (`.../api/jobs`, `.../api/profile`) — иначе запросы пойдут на `.../api/jobs/jobs` и дадут 400.

### 3. Запуск

```bash
npx expo start
```

Появится QR-код и меню: **a** — Android, **w** — Web. Для iOS — сканируйте QR-код в Expo Go.

### Быстрый старт по платформам

```bash
npm run web        # Web (http://localhost:8081)
npm run android    # Android
npm run ios        # iOS (только macOS)
```

## Expo Go на iOS (разработка с Windows)

Если iPhone не подключается при той же Wi‑Fi сети:

1. **Локальная сеть:** Настройки → Expo Go → Локальная сеть → **Включить**
2. **Брандмауэр Windows:** Разрешить входящие подключения на порт **8081** (Node/Metro)
3. **Режим tunnel:** `npm run start:tunnel` или `npx expo start --tunnel` — создаёт публичный URL, обходит проблемы с LAN
4. **Проверка IP:** `API_URL_DEFAULT` должен быть `http://ВАШ_IP:3000/api`, где IP — адрес ПК в сети

## Структура проекта

```
career-platform-app/frontend/
├── app/                     # Expo Router
│   ├── (auth)/              # login, register (с invite)
│   ├── (protected)/         # Требуют авторизации
│   │   ├── profile/         # Профиль, create, edit
│   │   ├── jobs/            # Список вакансий, детали, избранное
│   │   ├── recommendations/ # Рекомендации
│   └── admin/               # Админ-панель: /admin (users, jobs, recommendations, analytics)
│   └── _layout.tsx
├── src/
│   ├── features/            # auth, profile, jobs, career, analytics, admin
│   └── shared/              # config, lib, ui
├── app.config.js
├── package.json
└── tailwind.config.js
```

## Основные возможности

### Авторизация

- **Регистрация** — по email+паролю (`/register`) или по invite (`/register?invite=CODE`).
- **Вход по email и паролю** — JWT (access + refresh в cookie).
- **Вход через Google** — web (GIS), iOS/Android (expo-auth-session). Требуются отдельные OAuth client ID для каждой платформы в Google Cloud Console.
- **Вход через Telegram** — web (Login Widget). На мобильных открывается веб-версия в браузере.

### Профиль пользователя

- **Аватар и имя** - персональная информация
- **Направление деятельности** - Creative, IT, E-commerce, HoReCa
- **Уровень** - Junior, Middle, Senior, Lead
- **Навыки** - список профессиональных навыков
- **Опыт работы** - описание профессионального опыта
- **Карьерные цели** - Growth, Career Change, Skill Development, Leadership, Expertise

### Технические особенности

- ✅ Поддержка темной темы (автоматическое определение системной темы)
- ✅ Интернационализация (английский и русский языки)
- ✅ Валидация данных с помощью Zod
- ✅ Управление состоянием с Zustand
- ✅ Обработка ошибок с Error Boundary
- ✅ Безопасные области экрана (Safe Area)
- ✅ Адаптивный дизайн с Tailwind CSS
- ✅ Типизация с TypeScript (strict mode)

## 🛠️ Разработка

### Линтинг

```bash
npm run lint
```

### Форматирование кода

Проект использует Prettier для форматирования кода. Настройки находятся в `prettier.config.js`.

### Алиасы путей

Проект использует алиасы для импортов:

- `@/*` - корень проекта
- `@/src/*` - папка src
- `@/shared/*` - общие модули
- `@/features/*` - функциональные модули

Пример:

```typescript
import { useProfileStore } from '@/features/profile/store/profile-store';
import { ErrorBoundary } from '@/shared/ui/ErrorBoundary';
```

## 📱 Платформы

Приложение поддерживает:

- ✅ iOS
- ✅ Android
- ✅ Web

## 🌐 Интернационализация

Приложение поддерживает два языка:

- Английский (en)
- Русский (ru)

Переводы находятся в `src/shared/config/i18n/locales/`.

Использование:

```typescript
import { useTranslation } from '@/shared/lib/hooks/useTranslation';

const { t } = useTranslation('common');
const text = t('appName');
```

## 🎨 Стилизация

Проект использует **NativeWind** (Tailwind CSS для React Native). Стили применяются через атрибут `className`:

```tsx
<View className="flex-1 bg-gray-50 dark:bg-gray-900">
  <Text className="text-lg font-bold text-gray-900 dark:text-white">
    Заголовок
  </Text>
</View>
```

## Админ-панель

Подробная инструкция: [ADMIN_GUIDE.md](./ADMIN_GUIDE.md)

- **Приглашения** — создание invite-ссылок, копирование, деактивация
- **Вакансии** — CRUD
- **Рекомендации** — CRUD (единый раздел вместо дублирующих «сценариев»)
- **Аналитика** — KPI и воронка

## OAuth и Telegram (настройка)

### Google

В [Google Cloud Console](https://console.cloud.google.com/apis/credentials) создайте OAuth 2.0 Client ID:

| Тип | Параметры |
|-----|-----------|
| **Web** | Authorized JavaScript origins: `http://localhost:8081` |
| **iOS** | Bundle ID: `com.sil9.careerapp` |
| **Android** | Package: `com.sil9.careerapp`, SHA-1 из `keytool -list -v -keystore ~/.android/debug.keystore` |

### ⚠️ Expo Go и Google OAuth на iOS

**Google Sign-In не работает в Expo Go на iOS.** Expo Go использует bundle ID `host.exp.Exponent`, а в Google Cloud настроен `com.sil9.careerapp` — Google отклоняет запрос («Доступ заблокирован»).

**Решение:** использовать Development Build:
- **macOS:** `npx expo run:ios`
- **Windows (без Mac):** `eas build --profile development --platform ios` — сборка в облаке, установка на iPhone через ссылку

В Expo Go на iOS показывается заглушка вместо кнопки.

### Telegram

1. Создайте бота в [@BotFather](https://t.me/BotFather)
2. В настройках бота включите **Login Widget**
3. Укажите домен (ваш фронтенд: `frontend-chi-eight-35.vercel.app` или `localhost` для разработки)
4. Добавьте `EXPO_PUBLIC_TELEGRAM_BOT_USERNAME` в `.env` (без @)

## Деплой (Vercel)

1. Подключите репозиторий к [Vercel](https://vercel.com)
2. **Root Directory**: `frontend`
3. Переменные окружения: `API_URL_WEB`, `EXPO_PUBLIC_GOOGLE_CLIENT_ID`, `EXPO_PUBLIC_TELEGRAM_BOT_USERNAME`, `EXPO_PUBLIC_APP_URL` (URL вашего Vercel-домена)
4. Сборка: `npx expo export -p web` (уже в `vercel.json`)

## Сборка

### Development Build

```bash
npx expo run:android
npx expo run:ios
```

### Production (EAS Build)

```bash
npm install -g eas-cli
eas build --platform android
eas build --platform ios
```
