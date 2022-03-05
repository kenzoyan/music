from cgitb import lookup
from django.shortcuts import render
from django.http import JsonResponse
# Create your views here.
from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response

from .models import Room
from .serializers import RoomSerializer , CreateRoomSerializer

class RoomView(generics.ListAPIView):
    queryset = Room.objects.all()
    serializer_class = RoomSerializer


class GetRoom(APIView):
    serializer_class = RoomSerializer
    lookup_url = 'code'

    def get(self, request, format=None):
        code = request.GET.get(self.lookup_url)

        if code != None:
            room = Room.objects.filter(code=code)
            if len(room)>0:
                data = RoomSerializer(room[0]).data
                data['is_host']= self.request.session.session_key == room[0].host
                return Response(data,status=status.HTTP_200_OK)

            return Response({'Room Not Found': 'Invalid Room Code.'}, status=status.HTTP_404_NOT_FOUND)
        
        return Response({'Bad Request': 'Code paramater not found in request'}, status=status.HTTP_400_BAD_REQUEST)

class JoinRoom(APIView):
    lookup_url = 'code'

    def post(self, request, format=None):
        if not self.request.session.exists(self.request.session.session_key):
            self.request.session.create()
        code = request.data.get(self.lookup_url)
        
        if code != None:
            room = Room.objects.filter(code=code)
            if len(room)>0:
                room = room[0]
                self.request.session['room_code'] = room.code
                return Response({'success':'Room Joined'},status=status.HTTP_200_OK)

            return Response({'Room Not Found': 'Invalid Room Code.'}, status=status.HTTP_404_NOT_FOUND)
        
        return Response({'Bad Request': 'Code paramater not found in request'}, status=status.HTTP_400_BAD_REQUEST)

class CreateRoomView(APIView):
    serializer_class = CreateRoomSerializer

    def post(self, request, format=None):
        if not self.request.session.exists(self.request.session.session_key):
            self.request.session.create()
        
        serializer = self.serializer_class(data=request.data)

        if serializer.is_valid():
            guest_pause = serializer.data.get('guest_pause')
            votes_to_skip = serializer.data.get('votes_to_skip')
            host = self.request.session.session_key
            queryset = Room.objects.filter(host=host)

            if queryset.exists():
                room = queryset[0]
                room.guest_pause = guest_pause
                room.votes_to_skip = votes_to_skip
                room.save(update_fields=['guest_pause', 'votes_to_skip'])
                self.request.session['room_code'] = room.code
                return Response(RoomSerializer(room).data, status=status.HTTP_200_OK)

            else:
                room = Room(
                    guest_pause=guest_pause,
                    votes_to_skip=votes_to_skip,
                    host=host
                )
                room.save()
                self.request.session['room_code'] = room.code
                return Response(RoomSerializer(room).data, status= status.HTTP_201_CREATED)
        
        return Response({'Bad Request':'Invalid Data'}, status= status.HTTP_400_BAD_REQUEST)
    
class UserInRoom(APIView):

    def get(self, request, format=None):
        if not self.request.session.exists(self.request.session.session_key):
            self.request.session.create()
        
        data = {
            'code': self.request.session.get('room_code')
        }

        return JsonResponse(data,status=status.HTTP_200_OK)

class LeaveRoom(APIView):

    def post(self, request, format=None):
        if 'room_code' in self.request.session:
            self.request.session.pop('room_code')
            host_id = self.request.session.session_key
            room = Room.objects.filter(host=host_id)
            if room:
                room= room[0]
                room.delete()
        
        return Response({'Message': 'Success'}, status=status.HTTP_200_OK)
