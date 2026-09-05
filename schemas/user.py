from pydantic import BaseModel, ConfigDict, EmailStr
from typing import List, Optional
from datetime import datetime
from .common import UserBase
from .car import CarBase  # Классы User используют CarBase только как forward-ref; импорт до определения класса обязателен


# Схема для создания нового пользователя (регистрация)
class UserCreate(UserBase):
    password: str  # Пароль не должен быть включен в другие схемы для безопасности


# Схема для чтения информации о пользователе (без пароля)
class User(UserBase):
    id: int
    is_active: bool
    created_at: datetime  # fixed: must be datetime, not str
    cars: List[CarBase] = []  # Список автомобилей пользователя

    model_config = ConfigDict(from_attributes=True)


# Схема для обновления пользователя
class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    phone_number: Optional[str] = None
    is_active: Optional[bool] = None
    role: Optional[str] = None
    password: Optional[str] = None


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str