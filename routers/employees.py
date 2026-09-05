from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from database import get_db
from routers.auth import get_current_admin
import crud
import schemas

router = APIRouter(prefix="/employees", tags=["employees"])


@router.get("/", response_model=List[schemas.Employee])
def read_employees(skip: int = 0, limit: int = 100, db: Session = Depends(get_db),
                   _: schemas.User = Depends(get_current_admin)):
    """Список сотрудников (мастеров)."""
    return crud.get_employees(db, skip=skip, limit=limit)


@router.post("/", response_model=schemas.Employee, status_code=status.HTTP_201_CREATED)
def create_employee(employee: schemas.EmployeeCreate, db: Session = Depends(get_db),
                    _: schemas.User = Depends(get_current_admin)):
    return crud.create_employee(db=db, employee=employee)


@router.get("/{employee_id}", response_model=schemas.Employee)
def read_employee(employee_id: int, db: Session = Depends(get_db),
                  _: schemas.User = Depends(get_current_admin)):
    db_emp = crud.get_employee(db, employee_id=employee_id)
    if db_emp is None:
        raise HTTPException(status_code=404, detail="Сотрудник не найден")
    return db_emp


@router.put("/{employee_id}", response_model=schemas.Employee)
def update_employee(employee_id: int, employee_update: schemas.EmployeeUpdate, db: Session = Depends(get_db),
                    _: schemas.User = Depends(get_current_admin)):
    db_emp = crud.update_employee(db, employee_id=employee_id, employee_update=employee_update)
    if db_emp is None:
        raise HTTPException(status_code=404, detail="Сотрудник не найден")
    return db_emp


@router.delete("/{employee_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_employee(employee_id: int, db: Session = Depends(get_db),
                    _: schemas.User = Depends(get_current_admin)):
    success = crud.delete_employee(db, employee_id=employee_id)
    if not success:
        raise HTTPException(status_code=404, detail="Сотрудник не найден")
    return