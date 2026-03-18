import json
from django.contrib.auth import authenticate
from django.http import JsonResponse
from django.views import View
from rest_framework.authtoken.models import Token

from .models import User
from .serializers import RegisterSerializer, UserSerializer, ProfileSerializer

def get_user_from_token(request) -> User | None:
    """
    Helper function — reads the token from the request header
    and returns the User it belongs to, or None if invalid.
    """
    auth_header = request.headers.get("Authorization", "")
    if not auth_header.startswith("Token "):
        return None
    token_key = auth_header.split(" ")[1]
    try:
        token = Token.objects.get(key = token_key)
        return token.user
    except Token.DoesNotExist:
        return None
    
class RegisterView(View):
    """
    Register a new user.
    POST /api/auth/register/
    Permission : anyone
    """

    def post(self, request) -> JsonResponse:
        try:
            data = json.loads(request.body)
        except json.JSONDecodeError:
            return JsonResponse({"error": "Invalid JSON"}, status = 400)

        serializer = RegisterSerializer(data = data)
        if serializer.is_valid(): # Checks what the meta class tells to check
            user = serializer.save() # saves user
            token, _ = Token.objects.get_or_create(user=user) # Creates Token for user
            return JsonResponse(
                {"user": UserSerializer(user).data, "token": token.key},
                status=201
            ) # Json response
        return JsonResponse(serializer.errors, status=400)


class LoginView(View):
    """
    Login with username and password, get a token back.
    POST /api/auth/login/
    Permission: anyone
    """

    def post(self, request) -> JsonResponse:
        try:
            data = json.loads(request.body)
        except json.JSONDecodeError:
            return JsonResponse({"error": "Invalid JSON"}, status=400)

        username = data.get("username")
        password = data.get("password")
        user = authenticate(username=username, password=password) # Checks Credetials, retuns User else None
        if user:
            token, _ = Token.objects.get_or_create(user=user) # Gets or Creates a token
            return JsonResponse({"token": token.key}, status=200) # Retunes a token json
        return JsonResponse({"error": "Invalid credentials"}, status=401) # Retunes Error
    
class LogoutView(View):
    """
    Logout — deletes the user token.
    POST /api/auth/logout/
    Permission: must be logged in
    """

    def post(self, request) -> JsonResponse:
        user = get_user_from_token(request)
        if not user:
            return JsonResponse({"error": "Not authenticated"}, status=401)
        user.auth_token.delete() # Deletes the token
        return JsonResponse({}, status=204)


class UserListView(View):
    """
    Get list of all users.
    GET /api/users/
    Permission: must be logged in
    """

    def get(self, request) -> JsonResponse:
        user = get_user_from_token(request) # User or None
        if not user:
            return JsonResponse({"error": "Not authenticated"}, status=401)
        users = User.objects.all() # All users
        data = UserSerializer(users, many=True).data # list of users into JSON
        return JsonResponse({"users": list(data)}, status=200) # retuns JSON of users


class ProfileView(View):
    """
    Get or update a user profile.
    GET /api/users/<id>/profile/
    PUT /api/users/<id>/profile/
    Permission: must be logged in
    """

    def get(self, request, id: int) -> JsonResponse:
        user = get_user_from_token(request)
        if not user:
            return JsonResponse({"error": "Not authenticated"}, status=401)
        try:
            profile_user = User.objects.get(pk=id)
        except User.DoesNotExist:
            return JsonResponse({"error": "User not found"}, status=404)
        return JsonResponse(dict(ProfileSerializer(profile_user).data), status=200)

    def put(self, request, id: int) -> JsonResponse:
        user = get_user_from_token(request) # User or None
        if not user: # user = None
            return JsonResponse({"error": "Not authenticated"}, status=401) 
        if user.pk != id: # user != correct id
            return JsonResponse({"error": "You can only edit your own profile"}, status=403)
        try:
            profile_user = User.objects.get(pk=id)
        except User.DoesNotExist: # User doesnt exist return error
            return JsonResponse({"error": "User not found"}, status=404)
        try: 
            data = json.loads(request.body) # Converts to dict
        except json.JSONDecodeError:
            return JsonResponse({"error": "Invalid JSON"}, status=400) # Invalid JSON Error
        serializer = ProfileSerializer(profile_user, data=data, partial=True) 
        if serializer.is_valid(): # Checks if all fields meet the meta data class
            serializer.save()
            return JsonResponse(dict(serializer.data), status=200) # retuns 200 OK JSON
        return JsonResponse(serializer.errors, status=400) # retuns ERROR JSON