from rest_framework import serializers
from .models import Post


class PostSerializer(serializers.ModelSerializer):
    """
    Serializer for reading post data.

    Used when : GET /api/posts/ and GET /api/posts/<id>/
    Fields : all post fields + author username
    """

    author_username = serializers.CharField(source="author.username", read_only=True)
    image = serializers.ImageField(use_url=True)

    class Meta:
        model = Post
        fields = ["id", "author", "author_username", "image", "caption", "created_at", "updated_at"]
        read_only_fields = ["id", "author", "created_at", "updated_at"]


class PostWriteSerializer(serializers.ModelSerializer):
    """Write serializer, used for creating and updating posts."""

    class Meta:
        model = Post
        fields = ["image", "caption"]