from django.db import models

from api.models import Room

# Create your models here.


class SpotifyToken(models.Model):
    user = models.CharField(max_length=50, unique=True)
    createdAt = models.DateTimeField(auto_now_add=True)
    refreshToken = models.CharField(max_length=150)
    accessToken = models.CharField(max_length=150)
    expiresIn = models.DateTimeField()
    tokenType = models.CharField(max_length=50)


class Votes(models.Model):
    createdAt = models.DateTimeField(auto_now_add=True)
    user = models.CharField(max_length=50, unique=True)
    room = models.ForeignKey(Room, on_delete=models.CASCADE)
    songId = models.CharField(max_length=50, null=True)
