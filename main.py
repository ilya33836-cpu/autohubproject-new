from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import os
from dotenv import load_dotenv

# Load environment variables before importing modules that read configuration.
load_dotenv()

from database import init_db, SessionLocal
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
import crud
import schemas
import models

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
    """Создаёт таблицы БД и заполняет демо-данными при старте."""
    init_db()
    db = SessionLocal()
    try:
        if db.query(models.User).count() == 0:
            crud.create_user(db, schemas.UserCreate(
                username="admin",
                email="admin@autohub.ru",
                full_name="Администратор AUTOHUB",
                phone_number="+7 (900) 000-00-01",
                password="admin123",
                role="admin",
            ))
            crud.create_user(db, schemas.UserCreate(
                username="manager",
                email="manager@autohub.ru",
                full_name="Менеджер автосервиса",
                phone_number="+7 (900) 000-00-02",
                password="manager123",
                role="manager",
            ))
            crud.create_user(db, schemas.UserCreate(
                username="client",
                email="client@example.com",
                full_name="Иван Клиентов",
                phone_number="+7 (900) 123-45-67",
                password="client123",
                role="client",
            ))
            print("Созданы пользователи: admin/manager/client")

        if db.query(models.Service).count() == 0:
            base_services = [
                ("Замена масла", "Замена моторного масла и масляного фильтра", 2500, 60, "ТО"),
                ("Диагностика двигателя", "Базовая диагностика двигателя", 1800, 45, "Диагностика"),
                ("Компьютерная диагностика", "Считывание ошибок и анализ параметров", 1500, 30, "Диагностика"),
                ("Замена тормозных колодок", "Замена передних/задних тормозных колодок", 3200, 90, "Ремонт"),
                ("Шиномонтаж", "Балансировка и монтаж шин", 2200, 60, "Шиномонтаж"),
                ("Техническое обслуживание", "Комплексное ТО по регламенту", 7500, 180, "ТО"),
                ("Ремонт подвески", "Диагностика и ремонт ходовой части", 4000, 120, "Ремонт"),
            ]
            for name, desc, price, dur, cat in base_services:
                crud.create_service(db, schemas.ServiceCreate(
                    name=name, description=desc, price=price,
                    estimated_duration=dur, category=cat,
                ))
            print("Добавлены услуги")

        if db.query(models.Employee).count() == 0:
            for name, pos in [
                ("Иванов Сергей", "Мастер-диагност"),
                ("Петров Алексей", "Слесарь по ремонту"),
                ("Сидорова Мария", "Специалист по ТО"),
            ]:
                crud.create_employee(db, schemas.EmployeeCreate(full_name=name, position=pos))
            print("Добавлены сотрудники")

        db.commit()
    finally:
        db.close()


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
