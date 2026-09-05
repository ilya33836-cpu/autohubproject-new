"""Сервис напоминаний о плановом техническом обслуживании (ТО).

Запускается вручную или по расписанию (cron), проверяет автомобили
и создаёт уведомления клиентам, чей пробег достиг порога ТО.
"""
from sqlalchemy.orm import Session
from datetime import datetime

from database import SessionLocal
import crud
import schemas


def check_and_send_reminders():
    print(f"[{datetime.now()}] Запуск проверки напоминаний...")
    db: Session = SessionLocal()
    try:
        cars = crud.get_cars(db, skip=0, limit=10000)
        for car in cars:
            current_mileage = car.mileage or 0
            last_service_mileage = car.last_service_mileage or 0
            interval = car.service_interval_km or 10000

            threshold = last_service_mileage + interval
            if current_mileage >= threshold:
                print(
                    f"Найден автомобиль {car.brand} {car.model} (ID: {car.id}) "
                    f"для напоминания. Пробег: {current_mileage}, порог: {threshold}"
                )
                reminder_message = (
                    f"Рекомендуется пройти техническое обслуживание для "
                    f"{car.brand} {car.model}. Пробег достиг {current_mileage} км."
                )
                crud.create_notification(
                    db,
                    schemas.NotificationCreate(
                        user_id=car.owner_id,
                        message=reminder_message,
                        type="reminder",
                    ),
                )
                print(f"  Уведомление создано для пользователя ID {car.owner_id}")
    except Exception as e:  # noqa: BLE001
        print(f"Ошибка при проверке напоминаний: {e}")
    finally:
        db.close()


if __name__ == "__main__":
    check_and_send_reminders()