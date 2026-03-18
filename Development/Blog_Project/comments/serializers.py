from rest_framework import serializers
from .models import Comment


class CommentSerializer(serializers.ModelSerializer):
    """
    Serializer for reading comment data.

    Used when: GET /api/posts/<id>/comments/
    Fields: all comment fields + author username
    """

    author_username: str = serializers.CharField(
        source="author.username", read_only=True
    )

    class Meta:
        model = Comment
        fields = ("id", "post", "author", "author_username", "content", "created_at")
        read_only_fields = ("id", "author", "post", "created_at")


class CommentWriteSerializer(serializers.ModelSerializer):
    """
    Serializer for creating and updating a comment.

    Used when: POST /api/posts/<id>/comments/ and PUT /api/comments/<id>/
    Fields: content only — author and post are set automatically
    """

    content: str = serializers.CharField()

    class Meta:
        model = Comment
        fields = ("id", "content")