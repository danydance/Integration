import json
from django.http import JsonResponse
from django.views import View

from users.views import get_user_from_token # Import from users view to not copy pased
from .models import Post
from .serializers import PostSerializer, PostWriteSerializer


class PostListCreateView(View):
    """
    List all posts or create a new one.

    Endpoint: GET  /api/posts/        — returns paginated post list
              POST /api/posts/        — creates a new post
    Permission: must be logged in
    """

    def get(self, request) -> JsonResponse:
        """
        Return all posts ordered by newest first.
        """
        user = get_user_from_token(request)
        if not user:
            return JsonResponse({"error": "Not authenticated"}, status=401)

        posts = Post.objects.all().order_by("-created_at")
        data = PostSerializer(posts, many=True).data
        return JsonResponse({"posts": list(data)}, status=200)

    def post(self, request) -> JsonResponse:
        """
        Create a new post — author is set automatically from the token.
        """
        user = get_user_from_token(request)
        if not user:
            return JsonResponse({"error": "Not authenticated"}, status=401)

        try:
            data = json.loads(request.body)
        except json.JSONDecodeError:
            return JsonResponse({"error": "Invalid JSON"}, status=400)

        serializer = PostWriteSerializer(data=data)
        if serializer.is_valid():
            # author set from logged in user — not from request body
            post = serializer.save(author=user)
            return JsonResponse(PostSerializer(post).data, status=201)
        return JsonResponse(serializer.errors, status=400)


class PostDetailView(View):
    """
    Get, update or delete a specific post.

    Endpoint: GET    /api/posts/<id>/  — returns post
              PUT    /api/posts/<id>/  — updates post (owner only)
              DELETE /api/posts/<id>/ — deletes post (owner only)
    Permission: must be logged in — only owner can update or delete
    """

    def get_post(self, id : int) -> Post | None:
        """
        Gets post by id or return None if not found.
        Avoids repeating the try/except in every method.
        """
        try:
            return Post.objects.get(pk=id)
        except Post.DoesNotExist:
            return None

    def get(self, request, id: int) -> JsonResponse:
        """Return a single post by id."""
        user = get_user_from_token(request)
        if not user:
            return JsonResponse({"error": "Not authenticated"}, status=401)

        post = self.get_post(id)
        if not post:
            return JsonResponse({"error": "Post not found"}, status=404)

        return JsonResponse(PostSerializer(post).data, status=200)

    def put(self, request, id: int) -> JsonResponse:
        """Updates a post"""
        user = get_user_from_token(request)
        if not user:
            return JsonResponse({"error": "Not authenticated"}, status=401)

        post = self.get_post(id)
        if not post:
            return JsonResponse({"error": "Post not found"}, status=404)

        # Owner check, only the author/owner can edit their post
        if post.author != user:
            return JsonResponse({"error": "You can only edit your own posts"}, status=403)

        try:
            data = json.loads(request.body)
        except json.JSONDecodeError:
            return JsonResponse({"error": "Invalid JSON"}, status=400)

        serializer = PostWriteSerializer(post, data=data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return JsonResponse(PostSerializer(post).data, status=200)
        return JsonResponse(serializer.errors, status=400)

    def delete(self, request, id: int) -> JsonResponse:
        """Deletes a post"""
        user = get_user_from_token(request)
        if not user:
            return JsonResponse({"error": "Not authenticated"}, status=401)

        post = self.get_post(id)
        if not post:
            return JsonResponse({"error": "Post not found"}, status=404)

        # Owner check, only the author/owner can delete their post
        if post.author != user:
            return JsonResponse({"error": "You can only delete your own posts"}, status=403)

        post.delete()
        return JsonResponse({}, status=204)