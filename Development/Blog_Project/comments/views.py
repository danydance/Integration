import json
from django.http import JsonResponse
from django.views import View

from users.utils import get_user_from_token
from posts.utils import get_post_by_id
from .models import Comment
from .serializers import CommentSerializer, CommentWriteSerializer
from posts.models import Post


class CommentCollectionView(View):
    """
    List all comments on a post or create a new one.

    Endpoint: GET  /api/posts/<post_id>/comments/ — returns all comments on a post
              POST /api/posts/<post_id>/comments/ — creates a new comment
    Permission: must be logged in
    """


    def get(self, request, post_id: int) -> JsonResponse:
        """Return all comments for a specific post."""
        user = get_user_from_token(request)
        if not user:
            return JsonResponse({"error": "Not authenticated"}, status=401)

        post = get_post_by_id(post_id)
        if not post:
            return JsonResponse({"error": "Post not found"}, status=404)

        comments = Comment.objects.filter(post=post).order_by("created_at")
        data = CommentSerializer(comments, many=True).data
        return JsonResponse({"comments": list(data)}, status=200)

    def post(self, request, post_id: int) -> JsonResponse:
        """
        Create a new comment on a post.
        Author and post are set automatically — only content comes from request body.
        """
        user = get_user_from_token(request)
        if not user:
            return JsonResponse({"error": "Not authenticated"}, status=401)

        post = get_post_by_id(post_id)
        if not post:
            return JsonResponse({"error": "Post not found"}, status=404)

        try:
            data = json.loads(request.body)
        except json.JSONDecodeError:
            return JsonResponse({"error": "Invalid JSON"}, status=400)

        serializer = CommentWriteSerializer(data=data)
        if serializer.is_valid():
            # author from token, post from URL — not from request body
            comment = serializer.save(author=user, post=post)
            return JsonResponse(CommentSerializer(comment).data, status=201)
        return JsonResponse(serializer.errors, status=400)


class CommentDetailView(View):
    """
    Update or delete a specific comment.

    Endpoint: PUT    /api/comments/<id>/ — updates comment (owner only)
              DELETE /api/comments/<id>/ — deletes comment (owner only)
    Permission: must be logged in — only owner can update or delete
    """

    def get_comment(self, id: int) -> Comment | None:
        """Helper — fetch comment by id or return None if not found."""
        try:
            return Comment.objects.get(pk=id)
        except Comment.DoesNotExist:
            return None

    def put(self, request, id: int) -> JsonResponse:
        """Update a comment — only the author can do this."""
        user = get_user_from_token(request)
        if not user:
            return JsonResponse({"error": "Not authenticated"}, status=401)

        comment = self.get_comment(id)
        if not comment:
            return JsonResponse({"error": "Comment not found"}, status=404)

        # owner check — only the author can edit their comment
        if comment.author != user:
            return JsonResponse({"error": "You can only edit your own comments"}, status=403)

        try:
            data = json.loads(request.body)
        except json.JSONDecodeError:
            return JsonResponse({"error": "Invalid JSON"}, status=400)

        serializer = CommentWriteSerializer(comment, data=data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return JsonResponse(CommentSerializer(comment).data, status=200)
        return JsonResponse(serializer.errors, status=400)

    def delete(self, request, id: int) -> JsonResponse:
        """Delete a comment — only the author can do this."""
        user = get_user_from_token(request)
        if not user:
            return JsonResponse({"error": "Not authenticated"}, status=401)

        comment = self.get_comment(id)
        if not comment:
            return JsonResponse({"error": "Comment not found"}, status=404)

        # owner check — only the author can delete their comment
        if comment.author != user:
            return JsonResponse({"error": "You can only delete your own comments"}, status=403)

        comment.delete()
        return JsonResponse({}, status=204)