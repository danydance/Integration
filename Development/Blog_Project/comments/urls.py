from django.urls import path
from .views import CommentCollectionView, CommentDetailView

# All comments nested under posts
post_urlpatterns = [
    path("<int:post_id>/comments/", CommentCollectionView.as_view(), name="comment-list-create"),
    path("<int:post_id>/comments/<int:id>/", CommentDetailView.as_view(), name="comment-detail"),
]

# urlpatterns now empty — comment detail moved under posts
urlpatterns = []