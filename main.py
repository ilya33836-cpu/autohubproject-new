from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import os
from dotenv import load_dotenv

# Load environment variables before importing modules that read configuration.
load_dotenv()

from database import init_db
from routers import (
    auth,
    users,
    cars,
    services,
    orders,
    employees,
    admin_stats,
    notifications,
)

app = FastAPI(
    title="AUTOHUB API",
    description="API для управления автосервисом и обслуживания клиентов.",
    version="1.0.0",
)

# CORS — настраивается через переменные окружения
allowed_origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000")
origins = [origin.strip() for origin in allowed_origins.split(",")]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# HTTPS enforcement middleware (for production)
@app.middleware("http")
async def https_enforcement(request: Request, call_next):
    # Add security headers
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    # Uncomment for HTTPS-only in production:
    # response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    return response


@app.on_event("startup")
def on_startup():
    """Создаёт таблицы БД при старте приложения."""
    init_db()


# Подключаем роутеры
app.include_router(auth)
app.include_router(users)
app.include_router(cars)
app.include_router(services)
app.include_router(orders)
app.include_router(employees)
app.include_router(admin_stats)
app.include_router(notifications)


@app.get("/")
def read_root():
    return {"message": "Добро пожаловать в AUTOHUB API!"}


@app.get("/health")
def health_check():
    """Health check endpoint for monitoring."""
    return {"status": "healthy", "service": "AUTOHUB API"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
