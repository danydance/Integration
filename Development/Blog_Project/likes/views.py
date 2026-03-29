from django.http import JsonResponse
from django.views import View
from drf_spectacular.utils import extend_schema

from users.utils import get_user_from_token
from posts.utils import get_post_by_id
from .models import Like
from .serializers import LikeSerializer
from posts.models import Post


class LikeView(View):
    """
    Get likes, like a post, or unlike a post.

    Endpoint: GET    /api/posts/<post_id>/likes/ — returns like count + users
              POST   /api/posts/<post_id>/likes/ — like a post
              DELETE /api/posts/<post_id>/likes/ — unlike a post
    Permission: must be logged in
    """

    @extend_schema(
        responses={200: LikeSerializer(many=True)},
        summary="Get likes on a post",
        tags=["Likes"]
    )
    def get(self, request, post_id: int) -> JsonResponse:
        """Return like count and list of users who liked this post."""
        user = get_user_from_token(request)
        if not user:
            return JsonResponse({"error": "Not authenticated"}, status=401)

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
        """
        Like a post.
        Returns 400 if the user already liked this post.
        """
        user = get_user_from_token(request)
        if not user:
            return JsonResponse({"error": "Not authenticated"}, status=401)

        post = get_post_by_id(post_id)
        if not post:
            return JsonResponse({"error": "Post not found"}, status=404)

        # get_or_create returns (like, created) — created is True if new
        like, created = Like.objects.get_or_create(post=post, user=user)
        if not created:
            return JsonResponse(
                {"error": "You already liked this post"},
                status=400
            )

        return JsonResponse(LikeSerializer(like).data, status=201)

    @extend_schema(
        responses={204: None},
        summary="Unlike a post",
        tags=["Likes"]
    )
    def delete(self, request, post_id: int) -> JsonResponse:
        """
        Unlike a post.
        Returns 404 if the user hasn't liked this post yet.
        """
        user = get_user_from_token(request)
        if not user:
            return JsonResponse({"error": "Not authenticated"}, status=401)

        post = get_post_by_id(post_id)
        if not post:
            return JsonResponse({"error": "Post not found"}, status=404)

        try:
            like = Like.objects.get(post=post, user=user)
            like.delete()
            return JsonResponse({}, status=204)
        except Like.DoesNotExist:
            return JsonResponse(
                {"error": "You have not liked this post"},
                status=404
            )