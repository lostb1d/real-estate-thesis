from django.contrib import admin
from .models import User, Role, Permission, RolePermission, UserRole


@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ("id", "email", "username", "is_active", "is_staff")
    search_fields = ("email", "username")


@admin.register(Permission)
class PermissionAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "code", "module", "is_active")
    search_fields = ("name", "code")
    list_filter = ("module", "is_active")


@admin.register(Role)
class RoleAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "code", "is_system_role", "is_active")
    search_fields = ("name", "code")
    filter_horizontal = ("permissions",)


@admin.register(RolePermission)
class RolePermissionAdmin(admin.ModelAdmin):
    list_display = ("id", "role", "permission", "is_active")


@admin.register(UserRole)
class UserRoleAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "role", "is_active", "assigned_at")