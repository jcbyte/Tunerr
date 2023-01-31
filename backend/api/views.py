from django.shortcuts import render
from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from django.http import JsonResponse

from .models import Room
from .serializers import RoomSerializer, CreateRoomSerializer, UpdateRoomSerializer

SESSIONCODE = "code"

# Create your views here.


class RoomView(generics.ListAPIView):
    queryset = Room.objects.all()
    serializer_class = RoomSerializer


class GetRoomView(APIView):
    serializer_class = RoomSerializer
    lookup_url_kwarg = "code"

    def get(self, req, format=None):
        if not self.request.session.exists(self.request.session.session_key):
            self.request.session.create()

        code = req.GET.get(self.lookup_url_kwarg)
        if code:
            rooms = Room.objects.filter(code=code)
            if len(rooms) > 0:
                room = rooms[0]
                data = RoomSerializer(room).data
                data["isHost"] = self.request.session.session_key == room.host
                return Response(data, status=status.HTTP_200_OK)

            self.request.session[SESSIONCODE] = None
            return Response(
                {"Room not found": "Invalid room code"},
                status=status.HTTP_404_NOT_FOUND,
            )

        self.request.session[SESSIONCODE] = None
        return Response({"Bad request": "No code"}, status=status.HTTP_400_BAD_REQUEST)


class JoinRoomView(APIView):
    lookup_url_kwarg = "code"

    def post(self, req, format=None):
        if not self.request.session.exists(self.request.session.session_key):
            self.request.session.create()

        code = req.data.get(self.lookup_url_kwarg)
        if code:
            rooms = Room.objects.filter(code=code)
            if len(rooms) > 0:
                room = rooms[0]
                self.request.session[SESSIONCODE] = code
                return Response({"Success": "Room joined"}, status=status.HTTP_200_OK)

            return Response(
                {"Room not found": "Invalid room code"},
                status=status.HTTP_404_NOT_FOUND,
            )

        return Response({"Bad request": "No code"}, status=status.HTTP_400_BAD_REQUEST)


class CreateRoomView(APIView):
    serializer_class = CreateRoomSerializer

    def post(self, req, format=None):
        if not self.request.session.exists(self.request.session.session_key):
            self.request.session.create()

        serializer = self.serializer_class(data=req.data)
        if serializer.is_valid():
            guestCanPause = serializer.data.get("guestCanPause")
            skipVotes = serializer.data.get("skipVotes")
            host = self.request.session.session_key

            queryset = Room.objects.filter(host=host)
            if queryset.exists():
                room = queryset[0]
                room.guestCanPause = guestCanPause
                room.skipVotes = skipVotes
                room.save(update_fields=["guestCanPause", "skipVotes"])
            else:
                room = Room(host=host, guestCanPause=guestCanPause, skipVotes=skipVotes)
                room.save()

            self.request.session[SESSIONCODE] = room.code
            return Response(RoomSerializer(room).data, status=status.HTTP_200_OK)


class UserInRoomView(APIView):
    def get(self, req, format=None):
        if not self.request.session.exists(self.request.session.session_key):
            self.request.session.create()

        data = {
            "code": self.request.session.get(SESSIONCODE),
        }
        return JsonResponse(data, status=status.HTTP_200_OK)


class LeaveRoomView(APIView):
    def post(self, req, format=None):
        if SESSIONCODE in self.request.session:
            self.request.session.pop(SESSIONCODE)
            rooms = Room.objects.filter(host=self.request.session.session_key)
            if len(rooms) > 0:
                room = rooms[0]
                room.delete()

        return Response({"Success": "Room left"}, status=status.HTTP_200_OK)


class UpdateRoomView(APIView):
    serializer_class = UpdateRoomSerializer

    def patch(self, req, format=None):
        if not self.request.session.exists(self.request.session.session_key):
            self.request.session.create()

        serializer = self.serializer_class(data=req.data)
        if serializer.is_valid():
            code = serializer.data.get("code")

            rooms = Room.objects.filter(code=code)
            if rooms.exists():
                room = rooms[0]

                if room.host == self.request.session.session_key:
                    room.guestCanPause = serializer.data.get("guestCanPause")
                    room.skipVotes = serializer.data.get("skipVotes")
                    room.save(update_fields=["guestCanPause", "skipVotes"])
                    return Response(
                        {"Success": "Room updated"}, status=status.HTTP_200_OK
                    )

                return Response(
                    {"Forbidden": "Not host of room"},
                    status=status.HTTP_403_FORBIDDEN,
                )

            return Response(
                {"Room not found": "Invalid room code"},
                status=status.HTTP_404_NOT_FOUND,
            )

        return Response(
            {"Bad request": "Invalid data"}, status=status.HTTP_400_BAD_REQUEST
        )
