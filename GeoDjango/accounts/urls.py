from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import (
    UserViewSet,
    RoleViewSet,
    PermissionViewSet,
    UserRoleViewSet,
)

router = DefaultRouter()
router.register("users", UserViewSet)
router.register("roles", RoleViewSet)
router.register("permissions", PermissionViewSet)
router.register("user-roles", UserRoleViewSet)

urlpatterns = [
    path("", include(router.urls)),
]