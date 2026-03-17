from django.db import models
from django.conf import settings # imports the settings so we can reference AUTH_USER_MODEL


class Post(models.Model):
    author : str = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='posts') # author(User) can have many posts that what ForeignKey means
    title : str = models.CharField(max_length=255) # Short text for title
    content : str = models.TextField() # Unlimited text for body
    created_at = models.DateTimeField(auto_now_add=True) # The time now
    updated_at = models.DateTimeField(auto_now=True) # Updates every time

    def __str__(self) -> str: # Controls what prints when you print a Post class
        return self.title
