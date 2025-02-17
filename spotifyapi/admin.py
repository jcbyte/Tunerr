from django.contrib import admin

from .models import SpotifyToken, Votes

# Register your models here.

admin.site.register(SpotifyToken)
admin.site.register(Votes)
