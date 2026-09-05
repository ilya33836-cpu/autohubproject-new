from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from database import get_db
from routers.auth import get_current_admin
import crud
import schemas

router = APIRouter(prefix="/services", tags=["services"])


@router.get("/", response_model=List[schemas.Service])
def read_services(skip: int = 0, limit: int = 100, q: str = None, db: Session = Depends(get_db)):
    """Список услуг. Поддерживает поиск (q) по названию/категории/описанию."""
    return crud.get_services(db, skip=skip, limit=limit, search_query=q)


@router.get("/{service_id}", response_model=schemas.Service)
def read_service(service_id: int, db: Session = Depends(get_db)):
    db_service = crud.get_service(db, service_id=service_id)
    if db_service is None:
        raise HTTPException(status_code=404, detail="Услуга не найдена")
    return db_service


@router.post("/", response_model=schemas.Service, status_code=status.HTTP_201_CREATED)
def create_service(service: schemas.ServiceCreate, db: Session = Depends(get_db),
                   _: schemas.User = Depends(get_current_admin)):
    return crud.create_service(db=db, service=service)


@router.put("/{service_id}", response_model=schemas.Service)
def update_service(service_id: int, service_update: schemas.ServiceUpdate, db: Session = Depends(get_db),
                   _: schemas.User = Depends(get_current_admin)):
    db_service = crud.update_service(db, service_id=service_id, service_update=service_update)
    if db_service is None:
        raise HTTPException(status_code=404, detail="Услуга не найдена")
    return db_service


@router.delete("/{service_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_service(service_id: int, db: Session = Depends(get_db),
                   _: schemas.User = Depends(get_current_admin)):
    success = crud.delete_service(db, service_id=service_id)
    if not success:
        raise HTTPException(status_code=404, detail="Услуга не найдена")
    return