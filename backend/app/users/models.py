from django.db import models

from django.contrib.auth.models import AbstractUser


class User(AbstractUser):
    name = models.CharField(max_length=255)
    email = models.CharField(max_length=255, unique=True)
    password = models.CharField(max_length=255)
    image_url = models.URLField(max_length=1024, null=True, blank=True)
    username = None
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []
