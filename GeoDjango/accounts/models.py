from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils import timezone


class User(AbstractUser):
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=20, blank=True, null=True)
    is_verified = models.BooleanField(default=False)

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["username"]

    def __str__(self):
        return self.email

    def get_roles(self):
        return Role.objects.filter(
            user_roles__user=self,
            user_roles__is_active=True,
            is_active=True
        )

    def get_permissions(self):
        return Permission.objects.filter(
            role_permissions__role__user_roles__user=self,
            role_permissions__role__user_roles__is_active=True,
            role_permissions__role__is_active=True,
            role_permissions__is_active=True,
            is_active=True
        ).distinct()

    def has_custom_permission(self, permission_code):
        return self.get_permissions().filter(code=permission_code).exists()


class Permission(models.Model):
    MODULE_CHOICES = (
        ("user", "User Management"),
        ("role", "Role Management"),
        ("property", "Property Management"),
        ("map", "Map Management"),
        ("mcda", "MCDA Management"),
        ("report", "Report Management"),
        ("system", "System Management"),
    )

    name = models.CharField(max_length=100)
    code = models.CharField(max_length=150, unique=True)
    module = models.CharField(max_length=50, choices=MODULE_CHOICES)
    description = models.TextField(blank=True, null=True)

    is_active = models.BooleanField(default=True)

    created_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="created_custom_permissions"
    )

    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["module", "name"]

    def __str__(self):
        return self.code


class Role(models.Model):
    name = models.CharField(max_length=100)
    code = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True, null=True)

    is_system_role = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)

    created_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="created_custom_roles"
    )

    permissions = models.ManyToManyField(
        Permission,
        through="RolePermission",
        related_name="roles"
    )

    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["name"]

    def __str__(self):
        return self.name


class RolePermission(models.Model):
    role = models.ForeignKey(
        Role,
        on_delete=models.CASCADE,
        related_name="role_permissions"
    )

    permission = models.ForeignKey(
        Permission,
        on_delete=models.CASCADE,
        related_name="role_permissions"
    )

    is_active = models.BooleanField(default=True)

    assigned_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="assigned_custom_role_permissions"
    )

    assigned_at = models.DateTimeField(default=timezone.now)

    class Meta:
        unique_together = ("role", "permission")

    def __str__(self):
        return f"{self.role.name} -> {self.permission.code}"


class UserRole(models.Model):
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="user_roles"
    )

    role = models.ForeignKey(
        Role,
        on_delete=models.CASCADE,
        related_name="user_roles"
    )

    is_active = models.BooleanField(default=True)

    assigned_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="assigned_custom_user_roles"
    )

    assigned_at = models.DateTimeField(default=timezone.now)
    expires_at = models.DateTimeField(blank=True, null=True)

    class Meta:
        unique_together = ("user", "role")

    def __str__(self):
        return f"{self.user.email} -> {self.role.name}"

    def is_expired(self):
        if self.expires_at:
            return timezone.now() > self.expires_at
        return False