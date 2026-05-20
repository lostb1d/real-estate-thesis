from django.shortcuts import render

# Create your views here.
from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action

from .models import User, Role, Permission, RolePermission, UserRole
from .serializers import (
    UserSerializer,
    RoleSerializer,
    PermissionSerializer,
    RolePermissionSerializer,
    UserRoleSerializer,
)
from .permissions import HasCustomPermission

from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import AllowAny

from rest_framework.permissions import AllowAny, IsAuthenticated

from .serializers import (
    RegisterSerializer,
    LoginSerializer,
    VerifyOTPSerializer,
    ResendOTPSerializer,
    ForgotPasswordSerializer,
    ResetPasswordSerializer,
    ChangePasswordSerializer,
)


class RegisterAPIView(generics.CreateAPIView):
    permission_classes = [AllowAny]
    serializer_class = RegisterSerializer


class LoginAPIView(generics.GenericAPIView):
    permission_classes = [AllowAny]
    serializer_class = LoginSerializer

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        return Response(serializer.validated_data)


class VerifyOTPAPIView(generics.GenericAPIView):
    permission_classes = [AllowAny]
    serializer_class = VerifyOTPSerializer

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        return Response({
            "message": "Email verified successfully."
        })


class ResendOTPAPIView(generics.GenericAPIView):
    permission_classes = [AllowAny]
    serializer_class = ResendOTPSerializer

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        return Response({
            "message": "OTP sent successfully."
        })


class PermissionViewSet(viewsets.ModelViewSet):
    queryset = Permission.objects.all()
    serializer_class = PermissionSerializer
    permission_classes = [HasCustomPermission]
    required_permission = "permission.manage"

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)


class RoleViewSet(viewsets.ModelViewSet):
    queryset = Role.objects.all()
    serializer_class = RoleSerializer
    permission_classes = [HasCustomPermission]
    required_permission = "role.manage"

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

    @action(detail=True, methods=["post"])
    def assign_permission(self, request, pk=None):
        role = self.get_object()
        permission_id = request.data.get("permission_id")

        permission = Permission.objects.get(id=permission_id)

        role_permission, created = RolePermission.objects.get_or_create(
            role=role,
            permission=permission,
            defaults={"assigned_by": request.user}
        )

        if not created:
            role_permission.is_active = True
            role_permission.assigned_by = request.user
            role_permission.save()

        return Response({
            "message": "Permission assigned to role successfully."
        })


class UserRoleViewSet(viewsets.ModelViewSet):
    queryset = UserRole.objects.all()
    serializer_class = UserRoleSerializer
    permission_classes = [HasCustomPermission]
    required_permission = "role.assign"

    def perform_create(self, serializer):
        serializer.save(assigned_by=self.request.user)


class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [HasCustomPermission]
    required_permission = "user.manage"

    @action(detail=True, methods=["post"])
    def assign_role(self, request, pk=None):
        user = self.get_object()
        role_id = request.data.get("role_id")

        role = Role.objects.get(id=role_id)

        user_role, created = UserRole.objects.get_or_create(
            user=user,
            role=role,
            defaults={"assigned_by": request.user}
        )

        if not created:
            user_role.is_active = True
            user_role.assigned_by = request.user
            user_role.save()

        return Response({
            "message": "Role assigned to user successfully."
        })
    
class ForgotPasswordAPIView(generics.GenericAPIView):
    permission_classes = [AllowAny]
    serializer_class = ForgotPasswordSerializer

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        return Response({"message": "Password reset OTP sent successfully."})

class ResetPasswordAPIView(generics.GenericAPIView):
    permission_classes = [AllowAny]
    serializer_class = ResetPasswordSerializer

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        return Response({"message": "Password reset successfully."})
    
class ChangePasswordAPIView(generics.GenericAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = ChangePasswordSerializer

    def post(self, request):
        serializer = self.get_serializer(
            data=request.data,
            context={"request": request}
        )
        serializer.is_valid(raise_exception=True)
        return Response({"message": "Password changed successfully."})