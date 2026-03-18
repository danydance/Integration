from rest_framework import serializers
from .models import Like


class LikeSerializer(serializers.ModelSerializer):
    """
    Serializer for reading like data.

    Used when: GET /api/posts/<id>/likes/
    Fields: id, user, username, created_at
    """

    username: str = serializers.CharField(
        source="user.username", read_only=True
    )

    class Meta:
        model = Like
        fields = ("id", "user", "username")
        read_only_fields = ("id", "user")