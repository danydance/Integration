import json
from django.http import JsonResponse
from django.views import View

from users.utils import get_user_from_token # Import from users utils to not copy pased
from posts.utils import get_post_by_id
from .models import Post
from .serializers import PostSerializer, PostWriteSerializer


class PostCollectionView(View):
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

        posts = Post.objects.all().order_by("-created_at") # Newest first
        data = PostSerializer(posts, many=True).data # Multible Posts
        return JsonResponse({"posts": list(data)}, status=200) # Retunes JSON of posts

    def post(self, request) -> JsonResponse:
        """
        Create a new post, owner/auther is set automatically from the token.
        """
        user = get_user_from_token(request)
        if not user: # Checks if there is no User
            return JsonResponse({"error": "Not authenticated"}, status=401)

        try:
            data = json.loads(request.body)
        except json.JSONDecodeError:
            return JsonResponse({"error": "Invalid JSON"}, status=400)

        serializer = PostWriteSerializer(data=data)
        if serializer.is_valid(): # Checks if the fields are valid by the meta class
            # owner/auther set from logged in user not from request body
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

    def get(self, request, id: int) -> JsonResponse:
        """Return a single post by id."""
        user = get_user_from_token(request)
        if not user:
            return JsonResponse({"error": "Not authenticated"}, status=401)

        post = get_post_by_id(id)
        if not post:
            return JsonResponse({"error": "Post not found"}, status=404)

        return JsonResponse(PostSerializer(post).data, status=200)

    def put(self, request, id: int) -> JsonResponse:
        """Updates a post"""
        user = get_user_from_token(request)
        if not user:
            return JsonResponse({"error": "Not authenticated"}, status=401)

        post = get_post_by_id(id)
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

        post = get_post_by_id(id)
        if not post:
            return JsonResponse({"error": "Post not found"}, status=404)

        # Owner check, only the author/owner can delete their post
        if post.author != user:
            return JsonResponse({"error": "You can only delete your own posts"}, status=403)

        post.delete()
        return JsonResponse({}, status=204)