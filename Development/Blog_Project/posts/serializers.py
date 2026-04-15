from rest_framework import serializers
from .models import Post
from likes.models import Like
from comments.models import Comment

class PostSerializer(serializers.ModelSerializer):
    """
    Serializer for reading post data.

    Used when : GET /api/posts/ and GET /api/posts/<id>/
    Fields : all post fields + author username
    """

    author_username = serializers.CharField(source="author.username", read_only=True)
    image = serializers.ImageField(use_url=True)
    likes = serializers.SerializerMethodField()
    comments = serializers.SerializerMethodField()
    has_liked = serializers.SerializerMethodField()

    class Meta:
        model = Post
        fields = ["id", "author", "author_username", "image", "caption", "created_at", "updated_at", "likes", "comments", "has_liked"]
        read_only_fields = ["id", "author", "created_at", "updated_at"]
    
    def get_likes(self, obj) -> int:
        """Return total number of likes on this post."""
        return Like.objects.filter(post=obj).count()

    def get_comments(self, obj) -> int:
        """Return total number of comments on this post."""
        return Comment.objects.filter(post=obj).count()

    def get_has_liked(self, obj) -> bool:
        """Check if the current user has liked this post."""
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return False
        return Like.objects.filter(post=obj, user=request.user).exists()

class PostWriteSerializer(serializers.ModelSerializer):
    """Write serializer, used for creating and updating posts."""

    class Meta:
        model = Post
        fields = ["image", "caption"]