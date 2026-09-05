# AUTOHUB — CRM для автосервиса (FastAPI + Next.js)

Платформа автосервиса: витрина сайта, личный кабинет клиента (автомобили, онлайн-запись, история обслуживания, уведомления, PDF-отчёт по заказу) и CRM для сотрудников (дашборд со статистикой, управление записями/клиентами/автомобилями/услугами, календарь), плюс отдельный минималистичный интерфейс `/crm`.

## Стек

- **Backend:** Python 3.11, FastAPI, SQLAlchemy 2 (SQLite по умолчанию, поддерживается PostgreSQL через `DATABASE_URL`), JWT (pyjwt), passlib+bcrypt
- **Frontend:** Next.js 14 (pages router), React 18, Tailwind CSS, axios, chart.js, react-big-calendar, jsPDF

## Структура

```
├── main.py              # Точка входа FastAPI (CORS, security-заголовки, /health)
├── database.py          # Engine/Session/Base, DATABASE_URL из env
├── crud.py              # Слой доступа к данным
├── models/              # SQLAlchemy-модели (User, Car, Service, Order, ...)
├── schemas/             # Pydantic-схемы
├── routers/             # auth, users, cars, services, orders, employees, admin_stats, notifications
├── reminders.py         # Напоминания о ТО (запуск вручную или по cron)
├── seed.py              # Начальное наполнение БД (идемпотентно, пароли — случайные)
└── frontend/            # Next.js приложение
```

## Быстрый старт (локально, без Docker)

**Backend** (Python 3.11+):
```bash
python -m venv venv
venv\Scripts\activate            # Windows (Linux/Mac: source venv/bin/activate)
pip install -r requirements.txt
copy .env.example .env           # при необходимости отредактируйте значения
python seed.py                   # создаст admin/manager/client и демо-данные (пароли в консоли)
uvicorn main:app --reload        # http://127.0.0.1:8000 (документация: /docs)
```

**Frontend** (Node 18+):
```bash
cd frontend
npm install
npm run dev                      # http://localhost:3000
```

URL API задаётся переменной `NEXT_PUBLIC_API_URL` (по умолчанию `http://localhost:8000`) — она читается в `frontend/utils/api.js`.

## Запуск через Docker

```bash
docker compose up --build
```

- Frontend: http://localhost:3000
- API: http://localhost:8000, health-check: `/health`, Swagger: `/docs`

Для первичного наполнения БД выполните внутри контейнера backend: `docker compose exec backend python seed.py`.

## Переменные окружения

См. `.env.example`. Ключевые:

| Переменная | Назначение |
|---|---|
| `SECRET_KEY` | Секрет JWT (**обязательно** сменить в production: `openssl rand -hex 32`) |
| `DATABASE_URL` | `sqlite:////app/data/autohub.db` (Docker) или `postgresql+psycopg2://user:pass@host/db` |
| `ALLOWED_ORIGINS` | Домены фронтенда через запятую (CORS) |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Время жизни access-токена (по умолчанию 1440) |
| `NEXT_PUBLIC_API_URL` | Базовый URL API для фронтенда (вшивается при сборке) |
| `FRONTEND_URL` | Публичный URL frontend для ссылок восстановления пароля |
| `SMTP_HOST`, `SMTP_PORT` | SMTP-сервер и порт для восстановления пароля |
| `SMTP_USERNAME`, `SMTP_PASSWORD`, `SMTP_FROM` | Учётные данные и адрес отправителя recovery-писем |

## Деплой в production (чек-лист)

1. Задайте сильный `SECRET_KEY` и `ALLOWED_ORIGINS` с вашим доменом.
2. Переключитесь на PostgreSQL (`DATABASE_URL`) — SQLite годится только для демо.
3. Соберите фронтенд с `NEXT_PUBLIC_API_URL=https://api.ваш-домен` (или настройте reverse-proxy на один домен).
4. Запустите backend за HTTPS (nginx/Caddy/облачный балансировщик) — API уже добавляет security-заголовки.
5. `python seed.py` — пароли генерируются случайно и печатаются один раз в консоль; сразу смените их.
6. Задайте SMTP-переменные и `FRONTEND_URL`: recovery отправляет ссылку на `/reset-password`.
7. Настройте cron/планировщик для `python reminders.py` (напоминания о ТО).
8. Миграции схемы: Alembic пока не подключён — при изменении моделей используйте `Base.metadata.create_all` только для новых таблиц.

## Безопасность (что уже сделано)

- JWT-аутентификация; доступ к спискам клиентов/автомобилей/заказов — только для ролей admin/manager.
- Клиент видит и изменяет только свои автомобили и заказы (проверка владения на сервере).
- `forgot-password` не раскрывает существование email и никогда не возвращает пароль.
- CORS из env, security-заголовки (`X-Frame-Options`, `X-Content-Type-Options`, `X-XSS-Protection`), health-check для мониторинга.
