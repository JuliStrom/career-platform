# cp-app

Монорепо с двумя отдельными проектами:

- `backend` (бывший `cp-backend`)
- `frontend` (бывший `cp-frontend`)

## Структура

```text
cp-app/
├── backend/
├── frontend/
├── package.json
└── ENV_SETUP.md
```

## Запуск из корня проекта

1. Установить все зависимости:

```bash
npm run install:all
```

2. Запустить frontend и backend одновременно:

```bash
npm run dev
```

Дополнительно:

- Только backend: `npm run dev:backend`
- Только frontend: `npm run dev:frontend`
- Сборка backend: `npm run build:backend`
- Web-сборка frontend: `npm run build:frontend:web`

## Настройка окружения

Подробная инструкция по `.env`:

- [ENV_SETUP.md](./ENV_SETUP.md)
