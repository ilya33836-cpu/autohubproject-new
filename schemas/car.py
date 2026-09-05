from pydantic import BaseModel, ConfigDict
from typing import Optional
from .common import UserBase

# Базовая схема, общие поля
class CarBase(BaseModel):
    brand: str
    model: str
    year: int
    license_plate: Optional[str] = None
    vin: Optional[str] = None
    mileage: Optional[int] = 0
    photo_url: Optional[str] = None
    owner_id: int  # ID владельца

    # Поля для напоминаний
    last_service_mileage: Optional[int] = 0
    service_interval_km: Optional[int] = 10000


# Схема для создания нового автомобиля
class CarCreate(CarBase):
    pass


# Схема для чтения информации об автомобиле
class Car(CarBase):
    id: int
    owner: Optional[UserBase] = None  # Вложенный объект владельца

    model_config = ConfigDict(from_attributes=True)


# Схема для обновления автомобиля
class CarUpdate(BaseModel):
    brand: Optional[str] = None
    model: Optional[str] = None
    year: Optional[int] = None
    license_plate: Optional[str] = None
    vin: Optional[str] = None
    mileage: Optional[int] = None
    photo_url: Optional[str] = None
    last_service_mileage: Optional[int] = None
    service_interval_km: Optional[int] = None