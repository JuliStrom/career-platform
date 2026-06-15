# ENV manual

## 1) Backend env

Файл: `backend/.env`  
Шаблон: `backend/.env.example`

Скопируй шаблон и заполни значения:

```bash
cp backend/.env.example backend/.env
```

Для Windows PowerShell:

```powershell
Copy-Item "backend/.env.example" "backend/.env"
```

Минимально необходимые переменные:

```env
JWT_SECRET=ваш-секретный-ключ-минимум-32-символа
PORT=3000
MONGODB_URI=mongodb://localhost:27017/career_platform
CLIENT_URL=http://localhost:8081
NODE_ENV=development
```

Опционально (OAuth и Telegram):

```env
GOOGLE_CLIENT_ID=
TELEGRAM_BOT_TOKEN=
```

## 2) Frontend env

Файл: `frontend/.env`  
Шаблон: `frontend/.env.example`

Скопируй шаблон и заполни значения:

```bash
cp frontend/.env.example frontend/.env
```

Для Windows PowerShell:

```powershell
Copy-Item "frontend/.env.example" "frontend/.env"
```

Основные переменные:

```env
API_URL_WEB=http://localhost:3000/api
API_URL_DEFAULT=http://192.168.x.x:3000/api
API_URL_ANDROID_EMULATOR=http://10.0.2.2:3000/api
EXPO_PUBLIC_APP_URL=http://localhost:8081
```

OAuth/Telegram:

```env
EXPO_PUBLIC_GOOGLE_CLIENT_ID=
EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=
EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID=
EXPO_PUBLIC_TELEGRAM_BOT_USERNAME=
```

## 3) Проверка запуска

Из корня `cp-app`:

```bash
npm run install:all
npm run dev
```

Ожидаемый результат:

- backend доступен на `http://localhost:3000`
- frontend web на `http://localhost:8081`

## 4) Справочник AI-индекса (Блок 4)

После первого запуска MongoDB выполни из папки `backend`:

```bash
npm run seed
```

Так в коллекцию `ai_risk_index` попадут все пары «направление × уровень» (в т.ч. примеры из ТЗ). Без этого `GET /api/career/ai-risk` вернёт 404.

## 5) Типичные ошибки

- `EADDRINUSE:3000` -> порт 3000 занят, измени `PORT` в `backend/.env`.
- Frontend не видит API -> проверь, что `API_URL_WEB` заканчивается на `/api`.
- Телефон не подключается к API -> в `API_URL_DEFAULT` нужен IP твоего ПК в локальной сети, не `localhost`.
