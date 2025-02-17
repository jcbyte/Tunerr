from django.db import models
import string
import random


def genUniqueCode():
    LENGTH = 6
    while True:
        code = "".join(random.choices(string.ascii_uppercase, k=LENGTH))
        if Room.objects.filter(code=code).count() == 0:
            return code


# Create your models here.


class Room(models.Model):
    code = models.CharField(max_length=8, default=genUniqueCode, unique=True)
    host = models.CharField(max_length=50, unique=True)
    guestCanPause = models.BooleanField(null=False, default=False)
    skipVotes = models.IntegerField(null=False, default=1)
    createdTime = models.DateTimeField(auto_now_add=True)
    song = models.CharField(max_length=50, null=True)
