from django.urls import path
from .views import PostCollectionView, PostDetailView

urlpatterns = [
    path("", PostCollectionView.as_view(), name="post-list-create"),
    path("<int:id>/", PostDetailView.as_view(), name="post-detail"),
]