from rest_framework import serializers
from .models import User 

class RegisterSerializer(serializers.ModelSerializer): 
    """
    Serializer for user registration.

    Converts incoming JSON into a User object and saves it to the database.
    Used when: POST /api/auth/register/
    Fields: username, email, password (write-only)
    """
    password : str = serializers.CharField(write_only = True, min_length = 6) 

    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'password')
    
    def create(self, validated_data : dict) -> User:
        """
        Override default create() to hash the password before saving.
        Uses create_user() instead of create() for security. 
        create_user() comes from AbstractUser
        """
        user = User.objects.create_user(
            username = validated_data['username'],
            email = validated_data.get('email', ''),
            password = validated_data['password'],
        )
        return user

class UserSerializer(serializers.ModelSerializer):
    """
    Serializer for basic user information.

    Read-only serializer — never used for creating or updating.
    Used when: GET /api/users/
    Fields: id, username, email, date_joined
    """
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'date_joined')


class ProfileSerializer(serializers.ModelSerializer):
    """
    Serializer for viewing and updating a user profile.

    Used when: GET /api/users/<id>/profile/
               PUT /api/users/<id>/profile/
    Editable fields: bio, profile_picture
    Read-only fields: id, username (cannot be changed)
    """
    class Meta:
        model = User
        fields = ('id', 'username', 'bio', 'profile_picture', 'created_at')
        read_only_fields = ('id', 'username') # id and username fields can be seen but not changed.