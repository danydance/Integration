from django.urls import path
from .views import CommentCollectionView, CommentDetailView

# Comments under posts: /api/posts/<post_id>/comments/
post_urlpatterns = [
    path("<int:post_id>/comments/", CommentCollectionView.as_view(), name="comment-list-create"),
]

# Comments alone: /api/comments/<id>/
urlpatterns = [
    path("<int:id>/", CommentDetailView.as_view(), name="comment-detail"),
]