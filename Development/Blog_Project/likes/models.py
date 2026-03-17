from django.db import models
from django.conf import settings 
from posts.models import Post # Import Post model, each post has likes



class Like(models.Model):
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='likes') # Likes belong to Post
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='likes') # User Likes the post

    def __str__(self) -> str: # Controls what prints when you print a Like class
        return f"{self.user.username} liked {self.post.title}"