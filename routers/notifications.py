from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from database import get_db
from routers.auth import get_current_user
import crud
import models
import schemas

router = APIRouter(prefix="/notifications", tags=["notifications"])


@router.get("/my", response_model=List[schemas.Notification])
def read_my_notifications(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """Список уведомлений текущего пользователя."""
    if current_user.role in ("admin", "manager"):
        return crud.get_notifications_for_user(db, user_id=current_user.id, skip=skip, limit=limit)
    return crud.get_notifications_for_user(db, user_id=current_user.id, skip=skip, limit=limit)


@router.put("/{notification_id}", response_model=schemas.Notification)
def update_notification(
    notification_id: int,
    notification_update: schemas.NotificationUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """Отметить уведомление как прочитанное (только своё)."""
    notification = crud.get_notification(db, notification_id=notification_id)
    if not notification:
        raise HTTPException(status_code=404, detail="Уведомление не найдено")
    if notification.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Нет доступа к этому уведомлению")
    return crud.update_notification(db, notification_id=notification_id, notification_update=notification_update)


@router.post("/send", response_model=schemas.Notification)
def send_notification_to_user(
    notification_data: schemas.AdminNotificationCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """Отправка уведомления пользователю (только для admin/manager)."""
    if current_user.role not in ("admin", "manager"):
        raise HTTPException(status_code=403, detail="Доступ запрещён")
    target_user = crud.get_user(db, user_id=notification_data.user_id)
    if not target_user:
        raise HTTPException(status_code=404, detail="Пользователь не найден")
    return crud.create_notification(
        db,
        schemas.NotificationCreate(
            user_id=notification_data.user_id,
            message=notification_data.message,
            type=notification_data.type or "general",
        ),
    )