from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime
from .common import UserBase

# Базовая схема, общие поля
class NotificationBase(BaseModel):
    user_id: int
    message: str
    type: Optional[str] = "general"


# Схема для создания нового уведомления
class NotificationCreate(NotificationBase):
    pass


# Схема для чтения информации об уведомлении
class Notification(NotificationBase):
    id: int
    is_read: bool
    created_at: datetime
    user: UserBase

    model_config = ConfigDict(from_attributes=True)


# Схема для обновления уведомления (например, для отметки прочтения)
class NotificationUpdate(BaseModel):
    is_read: Optional[bool] = None


# Схема для отправки уведомления от админа
class AdminNotificationCreate(BaseModel):
    user_id: int
    message: str
    type: Optional[str] = "general"