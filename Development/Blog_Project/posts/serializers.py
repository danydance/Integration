from rest_framework import serializers
from .models import Post


class PostSerializer(serializers.ModelSerializer):
    """
    Serializer for reading post data.

    Used when : GET /api/posts/ and GET /api/posts/<id>/
    Fields : all post fields + author username
    """

    author_username : str = serializers.CharField(
        source="author.username", read_only=True
    )

    class Meta:
        model = Post
        fields = ("id", "author", "author_username", "title", "content", "created_at", "updated_at")
        read_only_fields = ("id", "author", "created_at", "updated_at")


class PostWriteSerializer(serializers.ModelSerializer):
    """
    Serializer for creating and updating a post.

    Used when : POST /api/posts/ and PUT /api/posts/<id>/
    Fields : only title and content (author is set automatically)
    """

    title : str = serializers.CharField()
    content : str = serializers.CharField()

    class Meta:
        model = Post
        fields = ("id", "title", "content")