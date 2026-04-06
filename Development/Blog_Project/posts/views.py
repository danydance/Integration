from django.http import JsonResponse
from rest_framework.views import APIView
from drf_spectacular.utils import extend_schema

from posts.utils import get_post_by_id
from .pagination import PostPagination
from users.permissions import IsAuthenticatedManual, IsOwnerOrReadOnly
from .models import Post
from .serializers import PostSerializer, PostWriteSerializer


class PostCollectionView(APIView):
    """
    List all posts or create a new one.

    Endpoint: GET  /api/posts/ — returns post list
              POST /api/posts/ — creates a new post
    Permission: must be logged in
    """
    permission_classes = [IsAuthenticatedManual]

    @extend_schema(
        responses={200: PostSerializer(many=True)},
        summary="Get all posts",
        tags=["Posts"]
    )
    def get(self, request) -> JsonResponse:
        """
        Return all posts ordered by newest first — paginated.
        Use ?page=2 to get the second page.
        Default page size is 10.
        """
        posts = Post.objects.all().order_by("-created_at")
        pagination = PostPagination(posts, request, page_size=10)
        return pagination.get_page()

    @extend_schema(
        request=PostWriteSerializer,
        responses={201: PostSerializer},
        summary="Create a post",
        tags=["Posts"]
    )
    def post(self, request) -> JsonResponse:
        """Create a new post — author set automatically from token."""
        data = request.data.dict() if hasattr(request.data, 'dict') else request.data
        serializer = PostWriteSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            post = serializer.save(author=request.user)
            return JsonResponse(PostSerializer(post, context={'request': request}).data, status=201)
        return JsonResponse(serializer.errors, status=400)


class PostDetailView(APIView):
    """
    Get, update or delete a specific post.

    Endpoint: GET    /api/posts/<id>/
              PATCH    /api/posts/<id>/
              DELETE /api/posts/<id>/
    Permission: must be logged in — only owner can update or delete
    """
    permission_classes = [IsAuthenticatedManual, IsOwnerOrReadOnly]

    @extend_schema(
        responses={200: PostSerializer},
        summary="Get a post",
        tags=["Posts"]
    )
    def get(self, request, id: int) -> JsonResponse:
        """Return a single post by id."""
        post = get_post_by_id(id)
        if not post:
            return JsonResponse({"error": "Post not found"}, status=404)
        return JsonResponse(PostSerializer(post).data, status=200)

    @extend_schema(
        request=PostWriteSerializer,
        responses={200: PostSerializer},
        summary="Update a post",
        tags=["Posts"]
    )
    def patch(self, request, id: int) -> JsonResponse:
        """Update a post — only the author can do this."""
        post = get_post_by_id(id)
        if not post:
            return JsonResponse({"error": "Post not found"}, status=404)

        # triggers IsOwnerOrReadOnly.has_object_permission()
        self.check_object_permissions(request, post)

        serializer = PostWriteSerializer(post, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return JsonResponse(PostSerializer(post).data, status=200)
        return JsonResponse(serializer.errors, status=400)

    @extend_schema(
        responses={204: None},
        summary="Delete a post",
        tags=["Posts"]
    )
    def delete(self, request, id: int) -> JsonResponse:
        """Delete a post — only the author can do this."""
        post = get_post_by_id(id)
        if not post:
            return JsonResponse({"error": "Post not found"}, status=404)

        # triggers IsOwnerOrReadOnly.has_object_permission()
        self.check_object_permissions(request, post)

        post.delete()
        return JsonResponse({}, status=204)