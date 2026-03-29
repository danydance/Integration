from django.urls import path
from .views import CommentCollectionView, CommentDetailView

urlpatterns = [
    path("<int:post_id>/comments/", CommentCollectionView.as_view(), name="comment-list-create"),
    path("comments/<int:id>/", CommentDetailView.as_view(), name="comment-detail"),
]