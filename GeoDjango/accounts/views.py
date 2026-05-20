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