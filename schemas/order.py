from pydantic import BaseModel, ConfigDict
from typing import Optional, List
from datetime import datetime
from .common import UserBase
from .car import CarBase
from .service import ServiceBase


# Схема элемента «работа» в заказе (много услуг на заказ)
class OrderServiceItem(BaseModel):
    service_id: int
    quantity: int = 1


class OrderServiceLine(BaseModel):
    id: int
    service_id: int
    name: str
    price: float
    quantity: int
    total: float

    model_config = ConfigDict(from_attributes=True)


# Базовая схема, общие поля
class OrderBase(BaseModel):
    user_id: int
    car_id: int
    service_id: int
    date_requested: Optional[datetime] = None
    status: Optional[str] = "new"
    total_cost: Optional[float] = 0.0
    mileage_at_order: Optional[int] = None
    comment_from_client: Optional[str] = None
    comment_from_master: Optional[str] = None
    recommendations: Optional[str] = None
    employee_id: Optional[int] = None  # назначенный мастер


# Схема для создания нового заказа
class OrderCreate(OrderBase):
    date_requested: datetime  # Обязательное поле при создании
    order_services: Optional[List[OrderServiceItem]] = []  # Дополнительные услуги


# Схема для чтения информации о заказе
class Order(OrderBase):
    id: int
    user: UserBase
    car: CarBase
    service: ServiceBase
    order_services: List[OrderServiceLine] = []

    model_config = ConfigDict(from_attributes=True)


# Схема для обновления заказа (например, изменения статуса)
class OrderUpdate(BaseModel):
    status: Optional[str] = None
    total_cost: Optional[float] = None
    comment_from_master: Optional[str] = None
    recommendations: Optional[str] = None
    employee_id: Optional[int] = None