from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os

# Используем переменную окружения для строки подключения или значение по умолчанию (SQLite для демо)
SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./autohub.db")

# connect_args нужен только для SQLite
connect_args = {"check_same_thread": False} if SQLALCHEMY_DATABASE_URL.startswith("sqlite") else {}

engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args=connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# ЕДИНАЯ Base для всех моделей проекта
Base = declarative_base()


# Зависимость для получения сессии БД
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    """Создаёт все таблицы на основе моделей и возвращает Base."""
    # Импортируем модели, чтобы они зарегистрировались в Base.metadata
    from models import (  # noqa: F401
        User, Car, Service, Order, OrderService, Notification, Employee,
    )
    Base.metadata.create_all(bind=engine)
    return Base