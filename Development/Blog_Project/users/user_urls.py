from django.urls import path
from .views import RegisterView, LoginView, LogoutView, UserListView, ProfileView

urlpatterns = [
    path("", UserListView.as_view(), name="user-list"),
    path("<int:id>/profile/", ProfileView.as_view(), name="user-profile"),
]