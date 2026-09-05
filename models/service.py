from sqlalchemy import Column, Integer, String, Float, Text
from sqlalchemy.orm import relationship
from database import Base


class Service(Base):
    __tablename__ = "services"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True, nullable=False)  # Название услуги
    description = Column(Text, nullable=True)  # Описание
    price = Column(Float, nullable=False)  # Цена
    estimated_duration = Column(Integer, nullable=True)  # Примерная продолжительность в минутах
    category = Column(String, index=True, nullable=True)  # Категория услуги

    orders = relationship("Order", back_populates="service")
    order_services = relationship("OrderService", back_populates="service")