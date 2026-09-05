from sqlalchemy import Column, Integer, String, DateTime, Boolean, desc
from sqlalchemy.orm import relationship
from database import Base
from datetime import datetime
from .notification import Notification


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String, nullable=True)
    phone_number = Column(String, nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    # role: client, manager, admin
    role = Column(String, default="client")

    # Связь: один пользователь (User) может владеть многими автомобилями (Car)
    cars = relationship("Car", back_populates="owner")
    # Связь: один пользователь (User) может иметь много заказов (Order)
    orders = relationship("Order", back_populates="user")
    # Связь: один пользователь (User) может получать много уведомлений (Notification)
    notifications = relationship("Notification", back_populates="user", order_by=desc(Notification.created_at))