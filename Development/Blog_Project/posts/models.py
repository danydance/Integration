from django.db import models
from django.conf import settings # imports the settings so we can reference AUTH_USER_MODEL


class Post(models.Model):
    """
    Represents a blog post with an image.
    """
    author : str = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='posts') # author(User) can have many posts that what ForeignKey means
    image = models.ImageField(
        upload_to='posts/',  # saved in media/posts/ folder
        blank=False
    ) # ImageField for picture
    caption: str = models.TextField(blank=True, default='') 
    created_at = models.DateTimeField(auto_now_add=True) # The time now
    updated_at = models.DateTimeField(auto_now=True) # Updates every time

    def __str__(self) -> str: # Controls what prints when you print a Post class
        return f"{self.author.username} — {self.created_at.date()}"
