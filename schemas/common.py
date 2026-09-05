from pydantic import BaseModel
from typing import Optional


class UserBase(BaseModel):
    """Минимальное представление пользователя.

    Вынесен в отдельный модуль, чтобы избежать кругового импорта
    между schemas.user и schemas.car.
    """
    username: str
    email: str
    full_name: Optional[str] = None
    phone_number: Optional[str] = None
    role: Optional[str] = "client"