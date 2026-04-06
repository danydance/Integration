from django.http import JsonResponse
from rest_framework.views import APIView
from drf_spectacular.utils import extend_schema

from posts.utils import get_post_by_id
from users.permissions import IsAuthenticatedManual, IsOwnerOrReadOnly
from .models import Comment
from .serializers import CommentSerializer, CommentWriteSerializer


class CommentCollectionView(APIView):
    """
    List all comments on a post or create a new one.

    Endpoint: GET  /api/posts/<post_id>/comments/
              POST /api/posts/<post_id>/comments/
    Permission: must be logged in
    """
    permission_classes = [IsAuthenticatedManual]

    @extend_schema(
        responses={200: CommentSerializer(many=True)},
        summary="Get all comments on a post",
        tags=["Comments"]
    )
    def get(self, request, post_id: int) -> JsonResponse:
        """Return all comments for a specific post."""
        post = get_post_by_id(post_id)
        if not post:
            return JsonResponse({"error": "Post not found"}, status=404)
        comments = Comment.objects.filter(post=post).order_by("created_at")
        data = CommentSerializer(comments, many=True).data
        return JsonResponse({"comments": list(data)}, status=200)

    @extend_schema(
        request=CommentWriteSerializer,
        responses={201: CommentSerializer},
        summary="Create a comment on a post",
        tags=["Comments"]
    )
    def post(self, request, post_id: int) -> JsonResponse:
        """Create a comment — author and post set automatically."""
        post = get_post_by_id(post_id)
        if not post:
            return JsonResponse({"error": "Post not found"}, status=404)
        serializer = CommentWriteSerializer(data=request.data)
        if serializer.is_valid():
            # author from token, post from URL — not from request body
            comment = serializer.save(author=request.user, post=post)
            return JsonResponse(CommentSerializer(comment).data, status=201)
        return JsonResponse(serializer.errors, status=400)


class CommentDetailView(APIView):
    """
    Update or delete a specific comment.

    Endpoint: PATCH    /api/comments/<id>/
              DELETE /api/comments/<id>/
    Permission: must be logged in — only owner can update or delete
    """
    permission_classes = [IsAuthenticatedManual, IsOwnerOrReadOnly]

    def get_comment(self, id: int) -> Comment | None:
        """Fetch comment by id or return None if not found."""
        try:
            return Comment.objects.get(pk=id)
        except Comment.DoesNotExist:
            return None

    @extend_schema(
        request=CommentWriteSerializer,
        responses={200: CommentSerializer},
        summary="Update a comment",
        tags=["Comments"]
    )
    def patch(self, request, id: int) -> JsonResponse:
        """Update a comment — only the author can do this."""
        comment = self.get_comment(id)
        if not comment:
            return JsonResponse({"error": "Comment not found"}, status=404)

        # triggers IsOwnerOrReadOnly.has_object_permission()
        self.check_object_permissions(request, comment)

        serializer = CommentWriteSerializer(comment, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return JsonResponse(CommentSerializer(comment).data, status=200)
        return JsonResponse(serializer.errors, status=400)

    @extend_schema(
        responses={204: None},
        summary="Delete a comment",
        tags=["Comments"]
    )
    def delete(self, request, id: int) -> JsonResponse:
        """Delete a comment — only the author can do this."""
        comment = self.get_comment(id)
        if not comment:
            return JsonResponse({"error": "Comment not found"}, status=404)

        # triggers IsOwnerOrReadOnly.has_object_permission()
        self.check_object_permissions(request, comment)

        comment.delete()
        return JsonResponse({}, status=204)