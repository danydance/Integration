from rest_framework.authtoken.models import Token
from .models import User


def get_user_from_token(request) -> User | None:
    """
    Read the token from the Authorization header and return the matching User.

    Expects header format: Authorization: Token <token_key>
    Returns the User if token is valid, None if missing or invalid.
    """
    auth_header = request.headers.get("Authorization", "")
    if not auth_header.startswith("Token "):
        return None

    token_key = auth_header.split(" ")[1]

    try:
        token = Token.objects.get(key=token_key)
        return token.user
    except Token.DoesNotExist:
        return None