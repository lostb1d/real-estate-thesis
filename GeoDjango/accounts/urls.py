from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import (
    RegisterAPIView,
    LoginAPIView,
    VerifyOTPAPIView,
    ResendOTPAPIView,
    UserViewSet,
    RoleViewSet,
    PermissionViewSet,
    UserRoleViewSet,
    ForgotPasswordAPIView,
    ResetPasswordAPIView,
    ChangePasswordAPIView,
    AgencyViewSet,
    AgencyEmployeeViewSet,
    SuperAdminUserViewSet,
    SuperAdminDashboardAPIView,
)

router = DefaultRouter()
# router.register("users", UserViewSet)
# router.register("roles", RoleViewSet)
# router.register("permissions", PermissionViewSet)
# router.register("user-roles", UserRoleViewSet)
router.register("agencies", AgencyViewSet, basename="agencies")
router.register("agency-employees", AgencyEmployeeViewSet, basename="agency-employees")
router.register(
    "superadmin/users",
    SuperAdminUserViewSet,
    basename="superadmin-users"
)
urlpatterns = [
    path("", include(router.urls)),
    path("register/", RegisterAPIView.as_view()),
    path("login/", LoginAPIView.as_view()),
    path("verify-otp/", VerifyOTPAPIView.as_view()),
    path("resend-otp/", ResendOTPAPIView.as_view()),
    path("forgot-password/", ForgotPasswordAPIView.as_view(), name="forgot-password"),
    path("reset-password/", ResetPasswordAPIView.as_view(), name="reset-password"),
    path("change-password/", ChangePasswordAPIView.as_view(), name="change-password"),
    path("superadmin/dashboard/", SuperAdminDashboardAPIView.as_view(), name="superadmin-dashboard"),
]