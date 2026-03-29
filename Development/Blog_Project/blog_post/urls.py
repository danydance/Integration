"""
URL configuration for blog_post project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView
from comments.urls import post_urlpatterns as comment_post_urls
from comments.urls import urlpatterns as comment_urls

urlpatterns = [
    path("admin/", admin.site.urls),

    # Auth
    path("api/auth/", include("users.auth_urls")),

    # Users
    path("api/users/", include("users.user_urls")),

    # Posts
    path("api/posts/", include("posts.urls")),

    # Comments under posts: /api/posts/<post_id>/comments/
    path("api/posts/", include((comment_post_urls, "comments-post"))),

    # Comments alone: /api/comments/<id>/
    path("api/comments/", include((comment_urls, "comments"))),

    # Likes
    path("api/posts/", include("likes.urls")),

    # Swagger
    path("api/schema/", SpectacularAPIView.as_view(), name="schema"),
    path("api/swagger/", SpectacularSwaggerView.as_view(url_name="schema"), name="swagger-ui"),
]