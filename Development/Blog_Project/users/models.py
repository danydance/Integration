from django.db import models
from django.contrib.auth.models import AbstractUser

# User class 
class User(AbstractUser): # The Abstract User has the normal user credentials like : usernmae, email, password and more...
    bio = models.TextField(blank=True, default='') # Creates a long field for the user
    profile_picture = models.CharField(max_length=500, blank=True, default='') # Creates a field for links
    created_at = models.DateTimeField(auto_now_add=True) # Automatically saves the exact date and time when the user is created

    def __str__(self): # Controls what prints when you print a User class
        return self.username