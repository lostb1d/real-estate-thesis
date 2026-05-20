from rest_framework import serializers
from .models import User, Role, Permission, RolePermission, UserRole


class PermissionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Permission
        fields = "__all__"
        read_only_fields = ("created_by", "created_at", "updated_at")


class RoleSerializer(serializers.ModelSerializer):
    permissions = PermissionSerializer(many=True, read_only=True)

    class Meta:
        model = Role
        fields = "__all__"
        read_only_fields = ("created_by", "created_at", "updated_at")


class RolePermissionSerializer(serializers.ModelSerializer):
    class Meta:
        model = RolePermission
        fields = "__all__"
        read_only_fields = ("assigned_by", "assigned_at")


class UserRoleSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserRole
        fields = "__all__"
        read_only_fields = ("assigned_by", "assigned_at")


class UserSerializer(serializers.ModelSerializer):
    roles = serializers.SerializerMethodField()
    permissions = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = (
            "id",
            "email",
            "username",
            "phone",
            "is_active",
            "is_verified",
            "roles",
            "permissions",
        )

    def get_roles(self, obj):
        return [role.code for role in obj.get_roles()]

    def get_permissions(self, obj):
        return [permission.code for permission in obj.get_permissions()]