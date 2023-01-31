from .models import SpotifyToken
from django.utils import timezone
from datetime import timedelta
from requests import post, put, get

from .credentials import CLIENT_ID, CLIENT_SECRET

BASE_URL = "https://api.spotify.com/v1/me/"


def getUserTokens(session):
    userTokens = SpotifyToken.objects.filter(user=session)
    if userTokens.exists():
        return userTokens[0]
    return None


def createUpdateUserToken(session, accessToken, tokenType, expiresIn, refreshToken):
    token = getUserTokens(session)
    expiresAt = timezone.now() + timedelta(seconds=expiresIn)

    if token:
        token.accessToken = accessToken
        token.refreshToken = refreshToken
        token.tokenType = tokenType
        token.expiresIn = expiresAt
        token.save(
            update_fields=[
                "accessToken",
                "refreshToken",
                "tokenType",
                "expiresIn",
            ]
        )

    else:
        token = SpotifyToken(
            user=session,
            accessToken=accessToken,
            refreshToken=refreshToken,
            tokenType=tokenType,
            expiresIn=expiresAt,
        )
        token.save()


def refreshToken(token):
    session = token.user
    refreshToken = token.refreshToken

    res = post(
        "https://accounts.spotify.com/api/token",
        data={
            "grant_type": "refresh_token",
            "refresh_token": refreshToken,
            "client_id": CLIENT_ID,
            "client_secret": CLIENT_SECRET,
        },
    ).json()

    accessToken = res.get("access_token")
    tokenType = res.get("token_type")
    expiresIn = res.get("expires_in")

    createUpdateUserToken(session, accessToken, tokenType, expiresIn, refreshToken)


def isAuthenticated(session):
    token = getUserTokens(session)
    if token:
        if token.expiresIn <= timezone.now():
            refreshToken(token)

        return True

    return False


def executeSpotifyAPIReq(session, endpoint, post_=False, put_=False):
    token = getUserTokens(session)
    headers = {
        "Content-Type": "application/json",
        "Authorization": token.tokenType + " " + token.accessToken,
    }

    if post_:
        return post(BASE_URL + endpoint, headers=headers)

    if put_:
        return put(BASE_URL + endpoint, headers=headers)

    response = get(BASE_URL + endpoint, {}, headers=headers)
    try:
        return response.json()
    except:
        return {"Error": "Issue with request", "response": response}


def playPauseSong(session, play):
    return executeSpotifyAPIReq(
        session, "player/" + ("play" if play else "pause"), put_=True
    )


def skipSong(session):
    return executeSpotifyAPIReq(session, "player/next", post_=True)
