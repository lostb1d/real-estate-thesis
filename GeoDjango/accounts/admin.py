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

from django.contrib import admin

from .models import (
    Agency,
    AgencyEmployee,
    PasswordResetOTP,
    EmailOTP,
)


class AgencyEmployeeInline(admin.TabularInline):
    model = AgencyEmployee
    extra = 1
    fields = (
        "user",
        "employee_role",
        "can_create_ads",
        "can_edit_ads",
        "can_delete_ads",
        "can_manage_employees",
        "is_active",
        "joined_at",
    )
    readonly_fields = ("joined_at",)


@admin.register(Agency)
class AgencyAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "name",
        "owner",
        "email",
        "phone",
        "registration_no",
        "pan_no",
        "is_verified",
        "is_active",
        "created_at",
    )

    list_filter = (
        "is_verified",
        "is_active",
        "created_at",
    )

    search_fields = (
        "name",
        "email",
        "phone",
        "registration_no",
        "pan_no",
        "owner__email",
        "owner__username",
    )

    readonly_fields = (
        "created_at",
        "updated_at",
    )

    fieldsets = (
        ("Agency Information", {
            "fields": (
                "name",
                "registration_no",
                "pan_no",
                "email",
                "phone",
                "address",
            )
        }),
        ("Owner", {
            "fields": (
                "owner",
            )
        }),
        ("Status", {
            "fields": (
                "is_verified",
                "is_active",
            )
        }),
        ("Timestamps", {
            "fields": (
                "created_at",
                "updated_at",
            )
        }),
    )

    inlines = [AgencyEmployeeInline]


@admin.register(AgencyEmployee)
class AgencyEmployeeAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "agency",
        "user",
        "employee_role",
        "can_create_ads",
        "can_edit_ads",
        "can_delete_ads",
        "can_manage_employees",
        "is_active",
        "joined_at",
    )

    list_filter = (
        "employee_role",
        "can_create_ads",
        "can_edit_ads",
        "can_delete_ads",
        "can_manage_employees",
        "is_active",
        "joined_at",
    )

    search_fields = (
        "agency__name",
        "user__email",
        "user__username",
        "user__first_name",
        "user__last_name",
    )

    readonly_fields = (
        "joined_at",
    )


@admin.register(EmailOTP)
class EmailOTPAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "user",
        "otp",
        "is_used",
        "created_at",
        "expires_at",
        "is_expired_display",
    )

    list_filter = (
        "is_used",
        "created_at",
        "expires_at",
    )

    search_fields = (
        "user__email",
        "user__username",
        "otp",
    )

    readonly_fields = (
        "created_at",
    )

    def is_expired_display(self, obj):
        return obj.is_expired()

    is_expired_display.boolean = True
    is_expired_display.short_description = "Expired"


@admin.register(PasswordResetOTP)
class PasswordResetOTPAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "user",
        "otp",
        "is_used",
        "created_at",
        "expires_at",
        "is_expired_display",
    )

    list_filter = (
        "is_used",
        "created_at",
        "expires_at",
    )

    search_fields = (
        "user__email",
        "user__username",
        "otp",
    )

    readonly_fields = (
        "created_at",
    )

    def is_expired_display(self, obj):
        return obj.is_expired()

    is_expired_display.boolean = True
    is_expired_display.short_description = "Expired"