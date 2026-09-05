"""Роутер аутентификации: регистрация, вход (JWT), получение текущего пользователя, восстановление пароля."""
import os
import smtplib
from email.message import EmailMessage
from dotenv import load_dotenv

load_dotenv()

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
import jwt
from datetime import datetime, timedelta
from typing import Optional
from passlib.context import CryptContext
from database import get_db
import crud
import models
import schemas

# --- Конфигурация для JWT ---
ENVIRONMENT = os.getenv("ENVIRONMENT", "development").lower()
SECRET_KEY = os.getenv("SECRET_KEY")
if not SECRET_KEY and ENVIRONMENT == "production":
    raise RuntimeError("SECRET_KEY must be set when ENVIRONMENT=production")
SECRET_KEY = SECRET_KEY or "development-only-secret-key"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "1440"))
RESET_TOKEN_EXPIRE_MINUTES = 60  # 1 час

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/token")

router = APIRouter(prefix="/auth", tags=["auth"])


def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)


def authenticate_user(db: Session, username: str, password: str):
    user = crud.get_user_by_username(db, username=username)
    if not user or not verify_password(password, user.hashed_password):
        return False
    return user


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def create_reset_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=RESET_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire, "type": "reset"})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def send_reset_email(recipient: str, reset_token: str):
    smtp_host = os.getenv("SMTP_HOST")
    smtp_port = int(os.getenv("SMTP_PORT", "587"))
    smtp_username = os.getenv("SMTP_USERNAME")
    smtp_password = os.getenv("SMTP_PASSWORD")
    sender = os.getenv("SMTP_FROM", smtp_username)
    frontend_url = os.getenv("FRONTEND_URL", "http://localhost:3000").rstrip("/")

    if not all((smtp_host, smtp_username, smtp_password, sender)):
        raise RuntimeError("SMTP_HOST, SMTP_USERNAME, SMTP_PASSWORD and SMTP_FROM must be configured")

    message = EmailMessage()
    message["Subject"] = "AUTOHUB: восстановление пароля"
    message["From"] = sender
    message["To"] = recipient
    message.set_content(
        f"Откройте ссылку для сброса пароля (действительна 1 час): "
        f"{frontend_url}/reset-password?token={reset_token}"
    )

    with smtplib.SMTP(smtp_host, smtp_port, timeout=15) as smtp:
        smtp.starttls()
        smtp.login(smtp_username, smtp_password)
        smtp.send_message(message)


def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    """Возвращает текущего аутентифицированного пользователя."""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Не удалось проверить учётные данные",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except jwt.PyJWTError:
        raise credentials_exception
    user = crud.get_user_by_username(db, username=username)
    if user is None:
        raise credentials_exception
    return user


def get_current_admin(current_user: models.User = Depends(get_current_user)):
    """Разрешает доступ только сотрудникам (admin/manager)."""
    if current_user.role not in ("admin", "manager"):
        raise HTTPException(status_code=403, detail="Недостаточно прав")
    return current_user


@router.post("/register", response_model=schemas.User, status_code=status.HTTP_201_CREATED)
def register_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = crud.get_user_by_username(db, username=user.username)
    if db_user:
        raise HTTPException(status_code=400, detail="Имя пользователя занято")
    db_email = crud.get_user_by_email(db, email=user.email)
    if db_email:
        raise HTTPException(status_code=400, detail="Пользователь с таким email уже зарегистрирован")
    created = crud.create_user(db=db, user=user)
    try:
        admins = db.query(models.User).filter(models.User.role.in_(["admin", "manager"])).all()
        for admin in admins:
            crud.create_notification(db, schemas.NotificationCreate(
                user_id=admin.id,
                message=f"Новый пользователь зарегистрировался: {created.full_name or created.username} (@{created.username})",
                type="new_user",
            ))
        db.commit()
    except Exception:
        db.rollback()
    return created


@router.post("/token", response_model=dict)
def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Неверное имя пользователя или пароль",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer", "role": user.role}


@router.get("/me", response_model=schemas.User)
def read_users_me(current_user: models.User = Depends(get_current_user)):
    return current_user


@router.post("/forgot-password")
def forgot_password(request: schemas.ForgotPasswordRequest, db: Session = Depends(get_db)):
    """Запрос на восстановление пароля.

    Ответ всегда нейтральный — не раскрываем, существует ли email.
    Пароль НИКОГДА не возвращается в ответе API. В production здесь
    отправляется письмо со ссылкой на /reset-password?token=<reset_token>.
    """
    user = crud.get_user_by_email(db, email=request.email)
    if user:
        reset_token = create_reset_token(data={"sub": user.username})
        try:
            send_reset_email(str(user.email), reset_token)
        except (OSError, smtplib.SMTPException, RuntimeError):
            if ENVIRONMENT == "production":
                raise HTTPException(status_code=503, detail="Сервис восстановления временно недоступен")
    return {"message": "Если пользователь с таким email существует, инструкции отправлены."}


@router.post("/reset-password")
def reset_password(request: schemas.ResetPasswordRequest, db: Session = Depends(get_db)):
    """Сброс пароля по токену."""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Неверный или просроченный токен сброса",
    )
    try:
        payload = jwt.decode(request.token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        token_type: str = payload.get("type")
        if username is None or token_type != "reset":
            raise credentials_exception
    except jwt.PyJWTError:
        raise credentials_exception
    user = crud.get_user_by_username(db, username=username)
    if user is None:
        raise credentials_exception
    hashed_password = pwd_context.hash(request.new_password)
    user.hashed_password = hashed_password
    db.add(user)
    db.commit()
    return {"message": "Пароль успешно изменён"}