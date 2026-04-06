from django.contrib.auth import authenticate
from django.http import JsonResponse
from rest_framework.views import APIView
from rest_framework.authtoken.models import Token
from drf_spectacular.utils import extend_schema

from .models import User
from .serializers import RegisterSerializer, UserSerializer, ProfileSerializer
from users.permissions import AuthRateThrottle, AllowAnyManual, IsAuthenticatedManual


class RegisterView(APIView):
    """
    Register a new user.

    Endpoint: POST /api/auth/register/
    Permission: public — no login required
    Request body: username, password
    Response: user object + token (201) or validation errors (400)
    """
    permission_classes = [AllowAnyManual]
    throttle_classes = [AuthRateThrottle]


    @extend_schema(
        request=RegisterSerializer,
        responses={201: UserSerializer},
        summary="Register a new user",
        tags=["Auth"]
    )
    def post(self, request) -> JsonResponse:
        """Create a new user account and return an auth token."""
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            token, _ = Token.objects.get_or_create(user=user)
            return JsonResponse(
                {"user": UserSerializer(user).data, "token": token.key},
                status=201
            )
        return JsonResponse(serializer.errors, status=400)


class LoginView(APIView):
    """
    Login with username and password.

    Endpoint: POST /api/auth/login/
    Permission: public — no login required
    Request body: username, password
    Response: token (200) or error (401)
    """
    permission_classes = [AllowAnyManual]
    throttle_classes = [AuthRateThrottle]

    @extend_schema(
        request=RegisterSerializer,
        responses={200: UserSerializer},
        summary="Login and get a token",
        tags=["Auth"]
    )
    def post(self, request) -> JsonResponse:
        """Authenticate the user and return their token."""
        username = request.data.get("username")
        password = request.data.get("password")

        # authenticate() checks hashed password — returns User or None
        user = authenticate(username=username, password=password)
        if user:
            token, _ = Token.objects.get_or_create(user=user)
            return JsonResponse({"token": token.key}, status=200)
        return JsonResponse({"error": "Invalid credentials"}, status=401)


class LogoutView(APIView):
    """
    Logout — deletes the user token.

    Endpoint: DELETE /api/auth/logout/
    Permission: must be logged in
    Response: (200)
    Note: deletes token only — user account is NOT deleted
    """
    permission_classes = [IsAuthenticatedManual]

    @extend_schema(
        responses={200: None},
        summary="Logout — deletes token",
        tags=["Auth"]
    )
    def delete(self, request) -> JsonResponse:
        """
        Delete the user token from the database.
        Returns 200 even if token was already deleted.
        """
        try:
            request.user.auth_token.delete()
        except Exception:
            # token already deleted or doesn't exist — still consider it a success
            pass
        return JsonResponse({"message": "Logged out successfully"}, status=200)


class UserListView(APIView):
    """
    Return a list of all registered users.

    Endpoint: GET /api/users/
    Permission: must be logged in
    """
    permission_classes = [IsAuthenticatedManual]

    @extend_schema(
        responses={200: UserSerializer(many=True)},
        summary="Get all users",
        tags=["Users"]
    )
    def get(self, request) -> JsonResponse:
        """Fetch all users and serialize them."""
        users = User.objects.all()
        data = UserSerializer(users, many=True).data
        return JsonResponse({"users": list(data)}, status=200)


class ProfileView(APIView):
    """
    Get or update a user profile.

    Endpoint: GET /api/users/<id>/profile/
              PATCH /api/users/<id>/profile/
    Permission: must be logged in — only owner can update
    """
    permission_classes = [IsAuthenticatedManual]

    @extend_schema(
        responses={200: ProfileSerializer},
        summary="Get user profile",
        tags=["Users"]
    )
    def get(self, request, id: int) -> JsonResponse:
        """Return the profile of the user with the given id."""
        try:
            profile_user = User.objects.get(pk=id)
        except User.DoesNotExist:
            return JsonResponse({"error": "User not found"}, status=404)
        return JsonResponse(dict(ProfileSerializer(profile_user).data), status=200)

    @extend_schema(
        request=ProfileSerializer,
        responses={200: ProfileSerializer},
        summary="Update user profile",
        tags=["Users"]
    )
    def patch(self, request, id: int) -> JsonResponse:
        """Update bio and profile_picture — only the owner can do this."""
        # owner check — only the owner can edit their own profile
        if request.user.pk != id:
            return JsonResponse({"error": "You can only edit your own profile"}, status=403)
        try:
            profile_user = User.objects.get(pk=id)
        except User.DoesNotExist:
            return JsonResponse({"error": "User not found"}, status=404)
        serializer = ProfileSerializer(profile_user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return JsonResponse(dict(serializer.data), status=200)
        return JsonResponse(serializer.errors, status=400)