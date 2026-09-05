from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime


class EmployeeBase(BaseModel):
    full_name: str
    position: Optional[str] = None
    phone_number: Optional[str] = None
    email: Optional[str] = None


class EmployeeCreate(EmployeeBase):
    pass


class Employee(EmployeeBase):
    id: int
    is_active: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class EmployeeUpdate(BaseModel):
    full_name: Optional[str] = None
    position: Optional[str] = None
    phone_number: Optional[str] = None
    email: Optional[str] = None
    is_active: Optional[bool] = None