from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from sqlalchemy.orm import joinedload
from sqlalchemy import or_

from database import get_db
from routers.auth import get_current_user, get_current_admin
import models
import crud
import schemas

router = APIRouter(prefix="/orders", tags=["orders"])


def _is_staff(user: models.User) -> bool:
    return user.role in ("admin", "manager")


@router.post("/", response_model=schemas.Order, status_code=status.HTTP_201_CREATED)
def create_order(order: schemas.OrderCreate, db: Session = Depends(get_db),
                 current_user: models.User = Depends(get_current_user)):
    """Создание заказа. Клиент может оформить заказ только от своего имени."""
    if not _is_staff(current_user) and order.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Нельзя создать заказ для другого пользователя")
    user = crud.get_user(db, user_id=order.user_id)
    car = crud.get_car(db, car_id=order.car_id)
    service = crud.get_service(db, service_id=order.service_id)
    if not user:
        raise HTTPException(status_code=404, detail="Клиент не найден")
    if not car:
        raise HTTPException(status_code=404, detail="Автомобиль не найден")
    if not service:
        raise HTTPException(status_code=404, detail="Услуга не найдена")
    if car.owner_id != order.user_id:
        raise HTTPException(status_code=400, detail="Автомобиль не принадлежит указанному клиенту")
    created = crud.create_order(db=db, order=order)
    try:
        admins = db.query(models.User).filter(models.User.role.in_(["admin", "manager"])).all()
        for admin in admins:
            crud.create_notification(db, schemas.NotificationCreate(
                user_id=admin.id,
                message=f"Новая сделка #{created.id} от клиента {user.full_name or user.username} на сумму {created.total_cost or 0} ₽",
                type="new_order",
            ))
        db.commit()
    except Exception:
        db.rollback()
    return created


@router.get("/my", response_model=List[schemas.Order])
def read_my_orders(skip: int = 0, limit: int = 100, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    """Список заказов текущего пользователя."""
    query = db.query(models.Order).options(
        joinedload(models.Order.user),
        joinedload(models.Order.car),
        joinedload(models.Order.service),
        joinedload(models.Order.order_services),
    ).filter(models.Order.user_id == current_user.id)
    return query.offset(skip).limit(limit).all()


@router.get("/", response_model=List[schemas.Order])
def read_orders(skip: int = 0, limit: int = 100, q: str = None, db: Session = Depends(get_db),
                _: models.User = Depends(get_current_admin)):
    """Список всех заказов (только сотрудники). Поиск (q) по ID, имени клиента, госномеру или статусу."""
    query = db.query(models.Order).options(
        joinedload(models.Order.user),
        joinedload(models.Order.car),
        joinedload(models.Order.service),
        joinedload(models.Order.order_services),
    )
    if q:
        try:
            search_int = int(q)
            query = query.filter(
                or_(
                    models.Order.id == search_int,
                    models.Order.user_id == search_int,
                    models.Order.car_id == search_int,
                    models.Order.service_id == search_int,
                )
            )
        except ValueError:
            q_like = f"%{q}%"
            query = query.join(models.User).join(models.Car).filter(
                or_(
                    models.User.full_name.ilike(q_like),
                    models.User.username.ilike(q_like),
                    models.Car.license_plate.ilike(q_like),
                    models.Order.status.ilike(q_like),
                )
            )
    return query.offset(skip).limit(limit).all()


@router.get("/{order_id}", response_model=schemas.Order)
def read_order(order_id: int, db: Session = Depends(get_db),
               current_user: models.User = Depends(get_current_user)):
    """Детали заказа: владелец или сотрудник."""
    db_order = db.query(models.Order).options(
        joinedload(models.Order.user),
        joinedload(models.Order.car),
        joinedload(models.Order.service),
        joinedload(models.Order.order_services),
    ).filter(models.Order.id == order_id).first()
    if db_order is None or (not _is_staff(current_user) and db_order.user_id != current_user.id):
        raise HTTPException(status_code=404, detail="Заказ не найден")
    return db_order


@router.put("/{order_id}", response_model=schemas.Order)
def update_order(order_id: int, order_update: schemas.OrderUpdate, db: Session = Depends(get_db),
                 _: models.User = Depends(get_current_admin)):
    db_order = crud.update_order(db, order_id=order_id, order_update=order_update)
    if db_order is None:
        raise HTTPException(status_code=404, detail="Заказ не найден")
    return db_order


@router.post("/{order_id}/services", response_model=schemas.Order)
def add_service_to_order(order_id: int, item: schemas.OrderServiceItem, db: Session = Depends(get_db),
                         _: models.User = Depends(get_current_admin)):
    """Добавить услугу (работу) к заказу и пересчитать итог."""
    db_order = crud.add_order_service(db, order_id=order_id, item=item)
    if db_order is None:
        raise HTTPException(status_code=404, detail="Заказ или услуга не найдены")
    return db_order


@router.delete("/{order_id}/services/{line_id}", response_model=schemas.Order)
def remove_service_from_order(order_id: int, line_id: int, db: Session = Depends(get_db),
                              _: models.User = Depends(get_current_admin)):
    db_order = crud.delete_order_service(db, order_id=order_id, line_id=line_id)
    if db_order is None:
        raise HTTPException(status_code=404, detail="Заказ или работа не найдены")
    return db_order


@router.delete("/{order_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_order(order_id: int, db: Session = Depends(get_db),
                 _: models.User = Depends(get_current_admin)):
    success = crud.delete_order(db, order_id=order_id)
    if not success:
        raise HTTPException(status_code=404, detail="Заказ не найден")
    return