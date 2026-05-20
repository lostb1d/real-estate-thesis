from rest_framework.permissions import BasePermission


class HasCustomPermission(BasePermission):
    required_permission = None

    def has_permission(self, request, view):
        required_permission = getattr(view, "required_permission", None)

        if not required_permission:
            return True

        if not request.user or not request.user.is_authenticated:
            return False

        return request.user.has_custom_permission(required_permission)