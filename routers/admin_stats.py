from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import Dict
from datetime import datetime, timedelta

from database import get_db
from routers.auth import get_current_admin
import models

router = APIRouter(prefix="/admin/stats", tags=["admin_stats"])


@router.get("/summary", response_model=Dict)
def get_summary_stats(db: Session = Depends(get_db), _=Depends(get_current_admin)):
    """Сводная статистика для дашборда админ-панели."""
    new_appointments_count = db.query(models.Order).filter(models.Order.status == 'new').count()
    statuses_in_work = ['accepted', 'in_progress', 'waiting_parts']
    cars_in_work_count = db.query(models.Order).filter(models.Order.status.in_(statuses_in_work)).count()
    completed_orders_count = db.query(models.Order).filter(models.Order.status == 'completed').count()

    total_revenue = db.query(func.sum(models.Order.total_cost)).filter(models.Order.status == 'completed').scalar()
    total_revenue = total_revenue or 0.0

    clients_count = db.query(models.User).filter(models.User.role == 'client').count()
    cars_count = db.query(models.Car).count()

    return {
        "new_appointments_count": new_appointments_count,
        "cars_in_work_count": cars_in_work_count,
        "completed_orders_count": completed_orders_count,
        "total_revenue": total_revenue,
        "clients_count": clients_count,
        "cars_count": cars_count,
    }


@router.get("/orders-by-day", response_model=Dict)
def get_orders_by_day(days: int = 14, db: Session = Depends(get_db), _=Depends(get_current_admin)):
    """Количество заказов по дням (для графика)."""
    since = datetime.utcnow() - timedelta(days=days)
    rows = (
        db.query(func.date(models.Order.date_requested), func.count(models.Order.id))
        .filter(models.Order.date_requested >= since)
        .group_by(func.date(models.Order.date_requested))
        .all()
    )
    return {"labels": [str(r[0]) for r in rows], "values": [r[1] for r in rows]}


@router.get("/revenue-by-day", response_model=Dict)
def get_revenue_by_day(days: int = 14, db: Session = Depends(get_db), _=Depends(get_current_admin)):
    """Выручка по дням (только завершённые заказы) — для графика."""
    since = datetime.utcnow() - timedelta(days=days)
    rows = (
        db.query(func.date(models.Order.date_requested), func.sum(models.Order.total_cost))
        .filter(models.Order.status == 'completed', models.Order.date_requested >= since)
        .group_by(func.date(models.Order.date_requested))
        .all()
    )
    return {"labels": [str(r[0]) for r in rows], "values": [r[1] or 0 for r in rows]}