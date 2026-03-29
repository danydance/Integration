from django.urls import path
from .views import LikeView

urlpatterns = [
    path("<int:post_id>/likes/", LikeView.as_view(), name="post-likes"),
]