from django.urls import path
from .views import (
    GetAuthenticateUrl,
    spotifyCallback,
    IsAuthenticated,
    GetCurrentSong,
    # PlaySong,
    # PauseSong,
    PlayPauseSong,
    SkipSong,
)

urlpatterns = [
    path("getAuthenticateUrl", GetAuthenticateUrl.as_view()),
    path("redirect", spotifyCallback),
    path("isAuthenticated", IsAuthenticated.as_view()),
    path("getCurrentSong", GetCurrentSong.as_view()),
    # path("playSong", PlaySong.as_view()),
    # path("pauseSong", PauseSong.as_view()),
    path("playPauseSong", PlayPauseSong.as_view()),
    path("skipSong", SkipSong.as_view()),
]
