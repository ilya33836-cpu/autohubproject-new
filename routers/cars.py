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

router = APIRouter(prefix="/cars", tags=["cars"])


def _is_staff(user: models.User) -> bool:
    return user.role in ("admin", "manager")


@router.post("/", response_model=schemas.Car, status_code=status.HTTP_201_CREATED)
def create_car(car: schemas.CarCreate, db: Session = Depends(get_db),
               current_user: models.User = Depends(get_current_user)):
    """Создание автомобиля. Клиент может создать автомобиль только себе."""
    if not _is_staff(current_user) and car.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Нельзя создать автомобиль для другого пользователя")
    owner = crud.get_user(db, user_id=car.owner_id)
    if not owner:
        raise HTTPException(status_code=404, detail="Владелец не найден")
    return crud.create_car_for_user(db=db, car=car)


@router.get("/my", response_model=List[schemas.Car])
def read_my_cars(skip: int = 0, limit: int = 100, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    """Список автомобилей текущего пользователя."""
    return crud.get_cars_by_owner(db, owner_id=current_user.id, skip=skip, limit=limit)


@router.get("/", response_model=List[schemas.Car])
def read_cars(skip: int = 0, limit: int = 100, q: str = None, db: Session = Depends(get_db),
              _: models.User = Depends(get_current_admin)):
    """Список всех автомобилей (только сотрудники). Поиск (q) по марке/модели/номеру/VIN."""
    query = db.query(models.Car).options(joinedload(models.Car.owner))
    if q:
        try:
            search_int = int(q)
            query = query.filter(
                or_(models.Car.id == search_int, models.Car.owner_id == search_int)
            )
        except ValueError:
            q_like = f"%{q}%"
            query = query.filter(
                or_(
                    models.Car.brand.ilike(q_like),
                    models.Car.model.ilike(q_like),
                    models.Car.license_plate.ilike(q_like),
                    models.Car.vin.ilike(q_like),
                )
            )
    return query.offset(skip).limit(limit).all()


@router.get("/{car_id}", response_model=schemas.Car)
def read_car(car_id: int, db: Session = Depends(get_db),
             current_user: models.User = Depends(get_current_user)):
    """Карточка автомобиля: владелец или сотрудник."""
    db_car = crud.get_car(db, car_id=car_id)
    if db_car is None or (not _is_staff(current_user) and db_car.owner_id != current_user.id):
        raise HTTPException(status_code=404, detail="Автомобиль не найден")
    return db_car


@router.put("/{car_id}", response_model=schemas.Car)
def update_car(car_id: int, car_update: schemas.CarUpdate, db: Session = Depends(get_db),
               current_user: models.User = Depends(get_current_user)):
    """Изменение автомобиля: владелец или сотрудник."""
    db_car = crud.get_car(db, car_id=car_id)
    if db_car is None or (not _is_staff(current_user) and db_car.owner_id != current_user.id):
        raise HTTPException(status_code=404, detail="Автомобиль не найден")
    return crud.update_car(db, car_id=car_id, car_update=car_update)


@router.delete("/{car_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_car(car_id: int, db: Session = Depends(get_db),
               current_user: models.User = Depends(get_current_user)):
    """Удаление автомобиля: владелец или сотрудник."""
    db_car = crud.get_car(db, car_id=car_id)
    if db_car is None or (not _is_staff(current_user) and db_car.owner_id != current_user.id):
        raise HTTPException(status_code=404, detail="Автомобиль не найден")
    crud.delete_car(db, car_id=car_id)
    return