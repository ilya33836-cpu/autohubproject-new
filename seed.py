"""Скрипт начального наполнения БД демо-данными.

Запуск:  python seed.py
Создаёт: администратора, менеджера, набор услуг, сотрудников (мастеров),
а также демонстрационного клиента с автомобилем и заказом.

ВАЖНО: В production используйте сложные пароли или генерируйте случайные!
"""
from database import init_db, SessionLocal
from datetime import datetime
import crud
import schemas
import models
import secrets


def generate_strong_password(length=12):
    """Генерирует случайный надёжный пароль."""
    alphabet = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*"
    return ''.join(secrets.choice(alphabet) for _ in range(length))


def seed():
    init_db()
    db = SessionLocal()
    try:
        # --- Администратор ---
        if not crud.get_user_by_username(db, "admin"):
            admin_password = generate_strong_password()
            crud.create_user(db, schemas.UserCreate(
                username="admin",
                email="admin@autohub.ru",
                full_name="Администратор AUTOHUB",
                phone_number="+7 (900) 000-00-01",
                password=admin_password,
                role="admin",
            ))
            print(f"Создан администратор: admin / {admin_password}")

        # --- Менеджер ---
        if not crud.get_user_by_username(db, "manager"):
            manager_password = generate_strong_password()
            crud.create_user(db, schemas.UserCreate(
                username="manager",
                email="manager@autohub.ru",
                full_name="Менеджер автосервиса",
                phone_number="+7 (900) 000-00-02",
                password=manager_password,
                role="manager",
            ))
            print(f"Создан менеджер: manager / {manager_password}")

        # --- Услуги ---
        base_services = [
            ("Замена масла", "Замена моторного масла и масляного фильтра", 2500, 60, "ТО"),
            ("Диагностика двигателя", "Базовая диагностика двигателя", 1800, 45, "Диагностика"),
            ("Компьютерная диагностика", "Считывание ошибок и анализ параметров", 1500, 30, "Диагностика"),
            ("Замена тормозных колодок", "Замена передних/задних тормозных колодок", 3200, 90, "Ремонт"),
            ("Шиномонтаж", "Балансировка и монтаж шин", 2200, 60, "Шиномонтаж"),
            ("Техническое обслуживание", "Комплексное ТО по регламенту", 7500, 180, "ТО"),
            ("Ремонт подвески", "Диагностика и ремонт ходовой части", 4000, 120, "Ремонт"),
        ]
        if db.query(models.Service).count() == 0:
            for name, desc, price, dur, cat in base_services:
                crud.create_service(db, schemas.ServiceCreate(
                    name=name, description=desc, price=price,
                    estimated_duration=dur, category=cat,
                ))
            print(f"Добавлено услуг: {len(base_services)}")

        # --- Сотрудники (мастера) ---
        if db.query(models.Employee).count() == 0:
            for name, pos in [
                ("Иванов Сергей", "Мастер-диагност"),
                ("Петров Алексей", "Слесарь по ремонту"),
                ("Сидорова Мария", "Специалист по ТО"),
            ]:
                crud.create_employee(db, schemas.EmployeeCreate(full_name=name, position=pos))
            print("Добавлены сотрудники (мастера): 3")

        # --- Демонстрационный клиент с автомобилем и заказом ---
        client = crud.get_user_by_username(db, "client")
        if not client:
            client_password = generate_strong_password()
            client = crud.create_user(db, schemas.UserCreate(
                username="client",
                email="client@example.com",
                full_name="Иван Клиентов",
                phone_number="+7 (900) 123-45-67",
                password=client_password,
                role="client",
            ))
            print(f"Создан клиент: client / {client_password}")

        if db.query(models.Car).filter(models.Car.owner_id == client.id).count() == 0:
            car = crud.create_car_for_user(db, schemas.CarCreate(
                brand="BMW", model="530i", year=2020,
                license_plate="А123ВС777", vin="WBA12345678901234",
                mileage=45200, owner_id=client.id, last_service_mileage=35000,
            ))
            service = db.query(models.Service).first()
            if service:
                crud.create_order(db, schemas.OrderCreate(
                    user_id=client.id,
                    car_id=car.id,
                    service_id=service.id,
                    date_requested=datetime.utcnow(),
                    status="new",
                    mileage_at_order=45200,
                    comment_from_client="Запись на ТО после отпуска",
                ))
            print("Созданы демо-клиент, автомобиль и заказ")

        if db.query(models.Notification).count() == 0:
            admin_user = crud.get_user_by_username(db, "admin")
            manager_user = crud.get_user_by_username(db, "manager")
            target_users = [u for u in [admin_user, manager_user] if u]
            for target in target_users:
                crud.create_notification(db, schemas.NotificationCreate(
                    user_id=target.id,
                    message="Новый клиент зарегистрирован: Иван Клиентов (@client)",
                    type="new_user",
                ))
                crud.create_notification(db, schemas.NotificationCreate(
                    user_id=target.id,
                    message="Заказ #1 оплачен клиентом Иван Клиентов",
                    type="order_paid",
                ))
                crud.create_notification(db, schemas.NotificationCreate(
                    user_id=target.id,
                    message="Новый отзыв получен от клиента Иван Клиентов",
                    type="review",
                ))
            print("Созданы демо-уведомления")

        db.commit()
        print("База данных успешно наполнена демо-данными.")
    finally:
        db.close()


if __name__ == "__main__":
    seed()