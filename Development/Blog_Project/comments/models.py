from django.db import models
from django.conf import settings
from posts.models import Post # Import Post Model, each post has comments


class Comment(models.Model):
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='comments') # Comment belong to Post
    author = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='comments') # User writes the Comment
    content : str = models.TextField() # Unlimited field to write the body
    created_at = models.DateTimeField(auto_now_add=True) # Date and time at the moment of creation

    def __str__(self) -> str: # Controls what prints when you print a Post class
        return f"{self.author.username} on {self.post.title}" 