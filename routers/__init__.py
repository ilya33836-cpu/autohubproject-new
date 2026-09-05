"""Роутеры API AUTOHUB."""
from .auth import router as auth
from .users import router as users
from .cars import router as cars
from .services import router as services
from .orders import router as orders
from .employees import router as employees
from .admin_stats import router as admin_stats
from .notifications import router as notifications

__all__ = [
    "auth",
    "users",
    "cars",
    "services",
    "orders",
    "employees",
    "admin_stats",
    "notifications",
]