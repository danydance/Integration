from django.urls import path
from .views import RegisterView, LoginView, LogoutView, UserListView, ProfileView

urlpatterns = [
    path("register/", RegisterView.as_view(), name="register"),
    path("login/", LoginView.as_view(), name="login"),
    path("logout/", LogoutView.as_view(), name="logout"),
    path("", UserListView.as_view(), name="user-list"),
    path("<int:id>/profile/", ProfileView.as_view(), name="user-profile"),
]