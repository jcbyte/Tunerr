from django.urls import path
from .views import (
    RoomView,
    CreateRoomView,
    GetRoomView,
    JoinRoomView,
    UserInRoomView,
    LeaveRoomView,
    UpdateRoomView,
)

urlpatterns = [
    path("room", RoomView.as_view()),
    path("createRoom", CreateRoomView.as_view()),
    path("getRoom", GetRoomView.as_view()),
    path("joinRoom", JoinRoomView.as_view()),
    path("userInRoom", UserInRoomView.as_view()),
    path("leaveRoom", LeaveRoomView.as_view()),
    path("updateRoom", UpdateRoomView.as_view()),
]
