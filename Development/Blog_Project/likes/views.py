from django.http import JsonResponse
from rest_framework.views import APIView
from drf_spectacular.utils import extend_schema

from posts.utils import get_post_by_id
from users.permissions import IsAuthenticatedManual
from .models import Like
from .serializers import LikeSerializer


class LikeView(APIView):
    """
    Get likes, like a post, or unlike a post.

    Endpoint: GET    /api/posts/<post_id>/likes/
              POST   /api/posts/<post_id>/likes/
              DELETE /api/posts/<post_id>/likes/
    Permission: must be logged in
    """
    permission_classes = [IsAuthenticatedManual]

    @extend_schema(
        responses={200: LikeSerializer(many=True)},
        summary="Get likes on a post",
        tags=["Likes"]
    )
    def get(self, request, post_id: int) -> JsonResponse:
        """Return like count and users who liked this post."""
        post = get_post_by_id(post_id)
        if not post:
            return JsonResponse({"error": "Post not found"}, status=404)
        likes = Like.objects.filter(post=post)
        return JsonResponse({
            "count": likes.count(),
            "users": list(LikeSerializer(likes, many=True).data)
        }, status=200)

    @extend_schema(
        responses={201: LikeSerializer},
        summary="Like a post",
        tags=["Likes"]
    )
    def post(self, request, post_id: int) -> JsonResponse:
        """Like a post — returns 400 if already liked."""
        post = get_post_by_id(post_id)
        if not post:
            return JsonResponse({"error": "Post not found"}, status=404)

        # get_or_create — created=True if new, False if already liked
        like, created = Like.objects.get_or_create(post=post, user=request.user)
        if not created:
            return JsonResponse({"error": "You already liked this post"}, status=409)
        return JsonResponse(LikeSerializer(like).data, status=201)

    @extend_schema(
        responses={200: None},
        summary="Unlike a post",
        tags=["Likes"]
    )
    def delete(self, request, post_id: int) -> JsonResponse:
        """Unlike a post — returns 404 if not liked yet."""
        post = get_post_by_id(post_id)
        if not post:
            return JsonResponse({"error": "Post not found"}, status=404)
        try:
            like = Like.objects.get(post=post, user=request.user)
            like.delete()
            return JsonResponse({}, status=200)
        except Like.DoesNotExist:
            return JsonResponse({"error": "You have not liked this post"}, status=404)