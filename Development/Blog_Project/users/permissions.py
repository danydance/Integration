from rest_framework.permissions import BasePermission
from users.utils import get_user_from_token


class AllowAnyManual(BasePermission):
    """
    Allows any request through.
    Used for endpoints that don't require login: register, login.
    """

    def has_permission(self, request, view) -> bool:
        return True


class IsAuthenticatedManual(BasePermission):
    """
    Checks manually if the user sent a valid token in the header.
    If valid — sets request.user and allows the request.
    If invalid or missing — blocks with 401.
    """

    def has_permission(self, request, view) -> bool:
        user = get_user_from_token(request)
        if user:
            # set request.user so views can use request.user directly
            request.user = user
            return True
        return False


class IsOwnerOrReadOnly(BasePermission):
    """
    Object-level permission.
    GET requests — always allowed for any authenticated user.
    PUT/DELETE — only allowed if the user owns the object.

    Used with: self.check_object_permissions(request, obj) in views.
    """

    def has_object_permission(self, request, view, obj) -> bool:
        # reading is always allowed
        if request.method in ("GET", "HEAD", "OPTIONS"):
            return True

        # only the owner writes
        return obj.author == request.user