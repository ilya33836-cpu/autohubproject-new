from sqlalchemy.orm import Session, joinedload
from typing import Optional
from passlib.context import CryptContext
from sqlalchemy import or_, func

import models
import schemas

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


# ---------- Users ----------
def get_user(db: Session, user_id: int):
    return db.query(models.User).filter(models.User.id == user_id).first()


def get_user_by_username(db: Session, username: str):
    return db.query(models.User).filter(func.lower(models.User.username) == func.lower(username)).first()


def get_user_by_email(db: Session, email: str):
    return db.query(models.User).filter(func.lower(models.User.email) == func.lower(email)).first()


def get_users(db: Session, skip: int = 0, limit: int = 100, search_query: Optional[str] = None):
    query = db.query(models.User)

    if search_query:
        try:
            search_int = int(search_query)
            query = query.filter(
                or_(
                    models.User.id == search_int,
                    models.User.cars.any(models.Car.id == search_int),
                    models.User.orders.any(models.Order.id == search_int),
                )
            )
        except ValueError:
            q_like = f"%{search_query}%"
            query = query.filter(
                or_(
                    models.User.username.ilike(q_like),
                    models.User.email.ilike(q_like),
                    models.User.full_name.ilike(q_like),
                    models.User.phone_number.ilike(q_like),
                )
            )

    return query.offset(skip).limit(limit).all()


def create_user(db: Session, user: schemas.UserCreate):
    hashed_password = pwd_context.hash(user.password)
    db_user = models.User(
        username=user.username,
        email=user.email,
        full_name=user.full_name,
        phone_number=user.phone_number,
        role=user.role or "client",
        hashed_password=hashed_password,
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


def update_user(db: Session, user_id: int, user_update: schemas.UserUpdate):
    db_user = get_user(db, user_id)
    if db_user:
        update_data=user_update.model_dump(exclude_unset=True)
        if 'password' in update_data and update_data['password']:
            update_data['hashed_password']=pwd_context.hash(update_data.pop('password'))
        for var,value in update_data.items():
            setattr(db_user,var,value)
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
    return db_user


def delete_user(db: Session, user_id: int):
    db_user = get_user(db, user_id)
    if db_user:
        db.delete(db_user)
        db.commit()
        return True
    return False


# ---------- Cars ----------
def get_car(db: Session, car_id: int):
    return db.query(models.Car).filter(models.Car.id == car_id).first()


def get_cars(db: Session, skip: int = 0, limit: int = 100, search_query: Optional[str] = None):
    query = db.query(models.Car).options(joinedload(models.Car.owner))

    if search_query:
        try:
            search_int = int(search_query)
            query = query.filter(
                or_(models.Car.id == search_int, models.Car.owner_id == search_int)
            )
        except ValueError:
            q_like = f"%{search_query}%"
            query = query.filter(
                or_(
                    models.Car.brand.ilike(q_like),
                    models.Car.model.ilike(q_like),
                    models.Car.license_plate.ilike(q_like),
                    models.Car.vin.ilike(q_like),
                )
            )

    return query.offset(skip).limit(limit).all()


def get_cars_by_owner(db: Session, owner_id: int, skip: int = 0, limit: int = 100):
    """Автомобили конкретного владельца (точный фильтр по owner_id)."""
    return (
        db.query(models.Car)
        .options(joinedload(models.Car.owner))
        .filter(models.Car.owner_id == owner_id)
        .offset(skip)
        .limit(limit)
        .all()
    )


def create_car_for_user(db: Session, car: schemas.CarCreate):
    db_car = models.Car(**car.model_dump())
    db.add(db_car)
    db.commit()
    db.refresh(db_car)
    return db_car


def update_car(db: Session, car_id: int, car_update: schemas.CarUpdate):
    db_car = get_car(db, car_id)
    if db_car:
        for var, value in vars(car_update).items():
            if value is not None:
                setattr(db_car, var, value)
        db.add(db_car)
        db.commit()
        db.refresh(db_car)
    return db_car


def delete_car(db: Session, car_id: int):
    db_car = get_car(db, car_id)
    if db_car:
        db.delete(db_car)
        db.commit()
        return True
    return False


# ---------- Services ----------
def get_service(db: Session, service_id: int):
    return db.query(models.Service).filter(models.Service.id == service_id).first()


def get_services(db: Session, skip: int = 0, limit: int = 100, search_query: Optional[str] = None):
    query = db.query(models.Service)

    if search_query:
        try:
            search_int = int(search_query)
            query = query.filter(models.Service.id == search_int)
        except ValueError:
            q_like = f"%{search_query}%"
            query = query.filter(
                or_(
                    models.Service.name.ilike(q_like),
                    models.Service.description.ilike(q_like),
                    models.Service.category.ilike(q_like),
                )
            )

    return query.offset(skip).limit(limit).all()


def create_service(db: Session, service: schemas.ServiceCreate):
    db_service = models.Service(**service.model_dump())
    db.add(db_service)
    db.commit()
    db.refresh(db_service)
    return db_service


def update_service(db: Session, service_id: int, service_update: schemas.ServiceUpdate):
    db_service = get_service(db, service_id)
    if db_service:
        for var, value in vars(service_update).items():
            if value is not None:
                setattr(db_service, var, value)
        db.add(db_service)
        db.commit()
        db.refresh(db_service)
    return db_service


def delete_service(db: Session, service_id: int):
    db_service = get_service(db, service_id)
    if db_service:
        db.delete(db_service)
        db.commit()
        return True
    return False


# ---------- Orders ----------
def get_order(db: Session, order_id: int):
    return db.query(models.Order).filter(models.Order.id == order_id).first()


def get_orders(db: Session, skip: int = 0, limit: int = 100, search_query: Optional[str] = None):
    query = db.query(models.Order)

    if search_query:
        try:
            search_int = int(search_query)
            query = query.filter(
                or_(
                    models.Order.id == search_int,
                    models.Order.user_id == search_int,
                    models.Order.car_id == search_int,
                    models.Order.service_id == search_int,
                )
            )
        except ValueError:
            q_like = f"%{search_query}%"
            query = query.join(models.User).join(models.Car).filter(
                or_(
                    models.User.full_name.ilike(q_like),
                    models.User.username.ilike(q_like),
                    models.Car.license_plate.ilike(q_like),
                    models.Order.status.ilike(q_like),
                )
            )

    return query.offset(skip).limit(limit).all()


def _recalculate_total(db: Session, order: models.Order) -> float:
    """Пересчитывает итоговую стоимость заказа на основе работ."""
    total = order.service.price if order.service else 0.0
    for line in order.order_services:
        total += (line.price or 0.0) * (line.quantity or 1)
    order.total_cost = round(total, 2)
    return order.total_cost


def create_order(db: Session, order: schemas.OrderCreate):
    data = order.model_dump()
    extra_services = data.pop("order_services", None) or []
    db_order = models.Order(**data)
    db.add(db_order)
    db.flush()  # получаем id заказа

    for item in extra_services:
        svc = get_service(db, item.service_id)
        if svc:
            db.add(models.OrderService(
                order_id=db_order.id,
                service_id=svc.id,
                name=svc.name,
                price=svc.price,
                quantity=item.quantity or 1,
            ))

    _recalculate_total(db, db_order)
    db.commit()
    db.refresh(db_order)
    return db_order


def update_order(db: Session, order_id: int, order_update: schemas.OrderUpdate):
    db_order = get_order(db, order_id)
    old_status = db_order.status if db_order else None
    if db_order:
        for var, value in vars(order_update).items():
            if value is not None:
                setattr(db_order, var, value)
        db.add(db_order)
        db.commit()
        db.refresh(db_order)

        # Если статус изменился — создаём уведомление клиенту
        new_status = db_order.status
        if old_status != new_status:
            car_name = f"{db_order.car.brand} {db_order.car.model}"
            message_text_map = {
                "confirmed": f"Ваша запись #{db_order.id} на {db_order.service.name} подтверждена.",
                "accepted": f"Ваш автомобиль {car_name} принят и передан в работу.",
                "in_progress": f"Начато выполнение работ по заказу #{db_order.id}.",
                "waiting_parts": f"Заказ #{db_order.id} ожидает поступления запчастей.",
                "completed": f"Работы по заказу #{db_order.id} завершены. Ваш автомобиль {car_name} готов к выдаче!",
                "cancelled": f"Заказ #{db_order.id} был отменён.",
            }
            message = message_text_map.get(
                new_status, f"Статус вашего заказа #{db_order.id} изменён на '{new_status}'."
            )
            create_notification(
                db,
                schemas.NotificationCreate(user_id=db_order.user_id, message=message, type="status_change"),
            )

    return db_order


def add_order_service(db: Session, order_id: int, item: schemas.OrderServiceItem):
    """Добавляет услугу в заказ и пересчитывает итог."""
    db_order = get_order(db, order_id)
    if not db_order:
        return None
    svc = get_service(db, item.service_id)
    if not svc:
        return None
    db.add(models.OrderService(
        order_id=order_id,
        service_id=svc.id,
        name=svc.name,
        price=svc.price,
        quantity=item.quantity or 1,
    ))
    _recalculate_total(db, db_order)
    db.commit()
    db.refresh(db_order)
    return db_order


def delete_order_service(db: Session, order_id: int, line_id: int):
    db_order = get_order(db, order_id)
    if not db_order:
        return None
    line = db.query(models.OrderService).filter(
        models.OrderService.id == line_id,
        models.OrderService.order_id == order_id,
    ).first()
    if line:
        db.delete(line)
        _recalculate_total(db, db_order)
        db.commit()
        db.refresh(db_order)
    return db_order


def delete_order(db: Session, order_id: int):
    db_order = get_order(db, order_id)
    if db_order:
        db.delete(db_order)
        db.commit()
        return True
    return False


# ---------- Employees ----------
def get_employee(db: Session, employee_id: int):
    return db.query(models.Employee).filter(models.Employee.id == employee_id).first()


def get_employees(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Employee).offset(skip).limit(limit).all()


def create_employee(db: Session, employee: schemas.EmployeeCreate):
    db_emp = models.Employee(**employee.model_dump())
    db.add(db_emp)
    db.commit()
    db.refresh(db_emp)
    return db_emp


def update_employee(db: Session, employee_id: int, employee_update: schemas.EmployeeUpdate):
    db_emp = get_employee(db, employee_id)
    if db_emp:
        for var, value in vars(employee_update).items():
            if value is not None:
                setattr(db_emp, var, value)
        db.add(db_emp)
        db.commit()
        db.refresh(db_emp)
    return db_emp


def delete_employee(db: Session, employee_id: int):
    db_emp = get_employee(db, employee_id)
    if db_emp:
        db.delete(db_emp)
        db.commit()
        return True
    return False


# ---------- Notifications ----------
def get_notification(db: Session, notification_id: int):
    return db.query(models.Notification).filter(models.Notification.id == notification_id).first()


def get_notifications_for_user(db: Session, user_id: int, skip: int = 0, limit: int = 100):
    return (
        db.query(models.Notification)
        .filter(models.Notification.user_id == user_id)
        .order_by(models.Notification.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )


def create_notification(db: Session, notification: schemas.NotificationCreate):
    db_notification = models.Notification(**notification.model_dump())
    db.add(db_notification)
    db.commit()
    db.refresh(db_notification)
    return db_notification


def update_notification(db: Session, notification_id: int, notification_update: schemas.NotificationUpdate):
    db_notification = get_notification(db, notification_id)
    if db_notification:
        for var, value in vars(notification_update).items():
            if value is not None:
                setattr(db_notification, var, value)
        db.add(db_notification)
        db.commit()
        db.refresh(db_notification)
    return db_notification


def delete_notification(db: Session, notification_id: int):
    db_notification = get_notification(db, notification_id)
    if db_notification:
        db.delete(db_notification)
        db.commit()
        return True
    return False