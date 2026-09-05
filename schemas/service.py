from pydantic import BaseModel, ConfigDict
from typing import Optional

# Базовая схема, общие поля
class ServiceBase(BaseModel):
    name: str
    description: Optional[str] = None
    price: float
    estimated_duration: Optional[int] = None # в минутах
    category: Optional[str] = None


# Схема для создания новой услуги
class ServiceCreate(ServiceBase):
    pass


# Схема для чтения информации об услуге
class Service(ServiceBase):
    id: int

    model_config = ConfigDict(from_attributes=True)  # Позволяет конвертировать объекты ORM в Pydantic-модели


# Схема для обновления услуги
class ServiceUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    estimated_duration: Optional[int] = None
    category: Optional[str] = None