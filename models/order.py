from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from database import Base
from datetime import datetime


class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)  # Клиент
    car_id = Column(Integer, ForeignKey("cars.id"), nullable=False)  # Автомобиль
    service_id = Column(Integer, ForeignKey("services.id"), nullable=False)  # Основная услуга
    employee_id = Column(Integer, ForeignKey("employees.id"), nullable=True)  # Назначенный мастер
    date_requested = Column(DateTime, default=datetime.utcnow)  # Дата и время записи
    status = Column(String, default="new")  # new, confirmed, accepted, in_progress, waiting_parts, completed, cancelled
    total_cost = Column(Float, default=0.0)  # Итоговая стоимость
    mileage_at_order = Column(Integer, nullable=True)  # Пробег при оформлении заказа
    comment_from_client = Column(Text, nullable=True)
    comment_from_master = Column(Text, nullable=True)
    recommendations = Column(Text, nullable=True)

    user = relationship("User", back_populates="orders")
    car = relationship("Car", back_populates="orders")
    service = relationship("Service", back_populates="orders")
    assigned_worker = relationship("Employee", back_populates="orders")
    order_services = relationship(
        "OrderService",
        back_populates="order",
        cascade="all, delete-orphan",
        order_by="OrderService.id",
    )