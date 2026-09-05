"""Модели базы данных AUTOHUB.

Импорт всех моделей здесь необходим, чтобы SQLAlchemy зарегистрировал их
в едином Base.metadata (см. database.Base) — без этого таблицы не создаются.
"""
from .notification import Notification
from .user import User
from .car import Car
from .service import Service
from .order import Order
from .order_service import OrderService
from .employee import Employee

__all__ = [
    "User",
    "Car",
    "Service",
    "Order",
    "OrderService",
    "Notification",
    "Employee",
]