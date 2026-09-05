from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from database import Base
from datetime import datetime


class Car(Base):
    __tablename__ = "cars"

    id = Column(Integer, primary_key=True, index=True)
    brand = Column(String, nullable=False)
    model = Column(String, nullable=False)
    year = Column(Integer, default=0, nullable=False)
    license_plate = Column(String, unique=True, index=True, nullable=True)  # Гос. номер
    vin = Column(String, unique=True, index=True, nullable=True)  # VIN
    mileage = Column(Integer, default=0)  # Пробег
    photo_url = Column(String, nullable=True)  # URL фото
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False)  # Владелец (ссылка на User)

    # Поля для напоминаний / ТО
    last_service_mileage = Column(Integer, default=0)  # Пробег при последнем ТО
    service_interval_km = Column(Integer, default=10000)  # Интервал ТО в км

    owner = relationship("User", back_populates="cars")
    orders = relationship("Order", back_populates="car", cascade="all, delete-orphan")