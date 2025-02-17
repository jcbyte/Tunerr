from django.shortcuts import render, redirect
from .credentials import REDIRECT_URI, CLIENT_ID, CLIENT_SECRET
from rest_framework.views import APIView
from requests import Request, post
from rest_framework import status
from rest_framework.response import Response

from .util import (
    createUpdateUserToken,
    isAuthenticated,
    executeSpotifyAPIReq,
    playPauseSong,
    skipSong,
)

from api.models import Room
from .models import Votes
from api.views import SESSIONCODE

# Create your views here.


class GetAuthenticateUrl(APIView):
    def get(self, req, format=None):
        scope = "user-read-playback-state user-modify-playback-state user-read-currently-playing"

        url = (
            Request(
                "GET",
                "https://accounts.spotify.com/authorize",
                params={
                    "scope": scope,
                    "response_type": "code",
                    "redirect_uri": REDIRECT_URI,
                    "client_id": CLIENT_ID,
                },
            )
            .prepare()
            .url
        )

        return Response({"url": url}, status=status.HTTP_200_OK)


class IsAuthenticated(APIView):
    def get(self, req, format=None):
        authenticated = isAuthenticated(self.request.session.session_key)
        return Response({"authenticated": authenticated}, status=status.HTTP_200_OK)


def spotifyCallback(req, format=None):
    code = req.GET.get("code")
    error = req.GET.get("error")

    res = post(
        "https://accounts.spotify.com/api/token",
        data={
            "grant_type": "authorization_code",
            "code": code,
            "redirect_uri": REDIRECT_URI,
            "client_id": CLIENT_ID,
            "client_secret": CLIENT_SECRET,
        },
    ).json()

    accessToken = res.get("access_token")
    tokenType = res.get("token_type")
    refreshToken = res.get("refresh_token")
    expiresIn = res.get("expires_in")
    error = res.get("error")

    if not req.session.exists(req.session.session_key):
        req.session.create()

    createUpdateUserToken(
        req.session.session_key, accessToken, tokenType, expiresIn, refreshToken
    )

    return redirect("frontend:")


class GetCurrentSong(APIView):
    def get(self, req, format=None):
        roomCode = self.request.session.get(SESSIONCODE)
        rooms = Room.objects.filter(code=roomCode)
        if not rooms.exists():
            return Response(
                {"Invalid room": "Not in room"}, status=status.HTTP_404_NOT_FOUND
            )
        room = rooms[0]
        host = room.host
        endpoint = "player/currently-playing"
        res = executeSpotifyAPIReq(host, endpoint)

        if "error" in res or "item" not in res:
            return Response({"type": "none"}, status=status.HTTP_200_OK)

        if res.get("currently_playing_type") == "ad":
            return Response({"type": "ad"}, status=status.HTTP_200_OK)

        item = res.get("item")

        songId = item.get("id")

        artists = ""
        for i, artist in enumerate(item.get("artists")):
            if i > 0:
                artists += ", "
            artists += artist.get("name")

        votes = Votes.objects.filter(room=room, songId=room.song)
        itemDetails = {
            "title": item.get("name"),
            "duration": item.get("duration_ms"),
            "progress": res.get("progress_ms"),
            "albumCover": item.get("album").get("images")[0].get("url"),
            "isPlaying": res.get("is_playing"),
            "songId": songId,
            "artists": artists,
            "type": "song",
            "votes": len(votes),
            "votesRequired": room.skipVotes,
        }

        self.updateRoomSong(room, songId)
        return Response(itemDetails, status=status.HTTP_200_OK)

    def updateRoomSong(self, room, songId):
        if room.song != songId:
            room.song = songId
            room.save(update_fields=["song"])

            votes = Votes.objects.filter(room=room).delete()


class PlayPauseSong(APIView):
    def put(self, req, format=None):
        play = req.data.get("play")

        roomCode = self.request.session.get(SESSIONCODE)
        room = Room.objects.filter(code=roomCode)[0]
        if self.request.session.session_key == room.host or room.guestCanPause:
            res = playPauseSong(room.host, play)

            data = {}
            try:
                data = res.json()
            except:
                pass

            if "error" in data:
                if data.get("error").get("reason") == "PREMIUM_REQUIRED":
                    return Response({}, status=status.HTTP_402_PAYMENT_REQUIRED)

                return Response({}, status=status.HTTP_400_BAD_REQUEST)

            return Response({}, status=status.HTTP_200_OK)

        return Response({}, status=status.HTTP_403_FORBIDDEN)


class SkipSong(APIView):
    def post(self, req, format=None):
        roomCode = self.request.session.get(SESSIONCODE)
        room = Room.objects.filter(code=roomCode)[0]

        votes = Votes.objects.filter(room=room, songId=room.song)
        votesNeeded = room.skipVotes

        user = self.request.session.session_key

        res = {}

        if user == room.host:
            res = self.skip(room.host, votes)
        elif not votes.filter(user=user).exists():
            if len(votes) + 1 >= votesNeeded:
                res = self.skip(room.host, votes)
            else:
                vote = Votes(
                    user=self.request.session.session_key,
                    room=room,
                    songId=room.song,
                )
                vote.save()

        data = {}
        try:
            data = res.json()
        except:
            pass

        if "error" in data:
            if data.get("error").get("reason") == "PREMIUM_REQUIRED":
                return Response({}, status=status.HTTP_402_PAYMENT_REQUIRED)

            return Response({}, status=status.HTTP_400_BAD_REQUEST)

        return Response({}, status=status.HTTP_200_OK)

    def skip(self, session, votes):
        votes.delete()
        return skipSong(session)
