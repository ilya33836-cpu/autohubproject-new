from sqlalchemy import Column, Integer, Float, String, ForeignKey
from sqlalchemy.orm import relationship
from database import Base


class OrderService(Base):
    """Строка «работа» внутри заказа (много услуг на один заказ).

    Поля name/price хранят снимок услуги на момент добавления, чтобы стоимость
    заказа не менялась при последующем изменении каталога услуг.
    """
    __tablename__ = "order_services"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id"), nullable=False)
    service_id = Column(Integer, ForeignKey("services.id"), nullable=False)
    name = Column(String, nullable=False)
    price = Column(Float, nullable=False, default=0.0)
    quantity = Column(Integer, nullable=False, default=1)

    order = relationship("Order", back_populates="order_services")
    service = relationship("Service", back_populates="order_services")

    @property
    def total(self):
        """Итоговая сумма строки (используется в схеме OrderServiceLine)."""
        return round((self.price or 0.0) * (self.quantity or 1), 2)

