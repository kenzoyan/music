from unicodedata import name
from urllib import response
from django.shortcuts import redirect
from matplotlib import artist
from .credentials import CLIENT_ID,CLIENT_SECRET, REDIRECT_URI
from rest_framework.views import APIView
from rest_framework import status
from rest_framework.response import Response
from django.utils import timezone
from datetime import timedelta
from requests import Request, post, put, get
from .models import  SpotifyToken, Vote
from api.models import Room

class AuthURL(APIView):
    def get(self, request, format=None):
        scopes = 'user-read-playback-state user-modify-playback-state user-read-currently-playing'
        url = Request('GET','https://accounts.spotify.com/authorize', params={
            'scope': scopes,
            'response_type': 'code',
            'redirect_uri': REDIRECT_URI,
            'client_id': CLIENT_ID
        } ).prepare().url

        return Response({'url':url}, status=status.HTTP_200_OK)


class IsAuth(APIView):
    def get(self, request, format=None):
        isAuth = is_account_auth(self.request.session.session_key) 
        return Response({'status':isAuth}, status=status.HTTP_200_OK )

class PauseSong(APIView):
    def put(self, request, format=None):
        roomcode = self.request.session.get('room_code')
        room = Room.objects.filter(code=roomcode)[0]
        if self.request.session.session_key == room.host or room.guest_pause:
            endpoint = 'player/pause'
            get_response_spotify_api(room.host,endpoint,put_=True)
            return Response({}, status=status.HTTP_204_NO_CONTENT)
        
        return Response({}, status=status.HTTP_403_FORBIDDEN)

class PlaySong(APIView):
    def put(self, request, format=None):
        roomcode = self.request.session.get('room_code')
        room = Room.objects.filter(code=roomcode)[0]
        if self.request.session.session_key == room.host or room.guest_pause:
            endpoint = 'player/play'
            get_response_spotify_api(room.host,endpoint,put_=True)
            return Response({}, status=status.HTTP_204_NO_CONTENT)
        
        return Response({}, status=status.HTTP_403_FORBIDDEN)

class SkipSong(APIView):
    def post(self, request, format=None):
        roomcode = self.request.session.get('room_code')
        room = Room.objects.filter(code=roomcode)[0]

        votes = Vote.objects.filter(room=room, song_id=room.current_song)
        votes_required = room.votes_to_skip
        if self.request.session.session_key == room.host or len(votes) + 1 >= votes_required:
            votes.delete()
            endpoint = 'player/next'
            get_response_spotify_api(room.host,endpoint,post_=True)
            
        else:
            vote = Vote(user=self.request.session.session_key, room=room,song_id=room.current_song)
            vote.save()
        
        return Response({}, status=status.HTTP_204_NO_CONTENT)

class CurrentSong(APIView):
    def get(self, request, format=None):
        roomcode = self.request.session.get('room_code')
        room = Room.objects.filter(code=roomcode)

        if room.exists:
            room = room[0]
        else:
            return Response({}, status=status.HTTP_404_NOT_FOUND)

        host =room.host
        endpoint = 'player/currently-playing'
        response = get_response_spotify_api(host,endpoint)
        
        if 'error' in response or 'item' not in response:
            return Response({}, status=status.HTTP_204_NO_CONTENT)
        
        
        progress = response.get('progress_ms')
        is_playing = response.get('is_playing')
        item = response.get('item')
        duration = item.get('duration_ms')
        album_cover = item.get('album').get('images')[0].get('url')
        song_id = item.get('id')

        # handle >1 artists

        artists_name = ''
        
        for i, person in enumerate(item.get('artists')):
            if i > 0:
                artists_name += '&'
            name = person.get('name')
            artists_name += name
        
        votes_now = len(Vote.objects.filter(room=room, song_id=room.current_song))

        # return JSON
        song = {
            'title': item.get('name'),
            'artist': artists_name,
            'duration': duration,
            'time': progress,
            'image_url': album_cover,
            'is_playing': is_playing,
            'votes': votes_now,
            'votes_required': room.votes_to_skip,
            'id': song_id
        }
        self.update_room_song(room,song_id)

        return Response(song, status=status.HTTP_200_OK )

    def update_room_song(self, room , song_id):
        current_song = room.current_song

        if current_song != song_id:
            room.current_song =song_id
            room.save(update_fields=['current_song'])
            Vote.objects.filter(room=room).delete()

BASE_URL = "https://api.spotify.com/v1/me/"

def get_response_spotify_api(session_id, endpoint, post_= False, put_= False):
    tokens = SpotifyToken.objects.filter(user = session_id)
    if tokens.exists():
        tokens = tokens[0]
    else:
        return {'error': 'Request error'}

    headers = {'Content-Type': 'application/json',
               'Authorization': "Bearer " + tokens.access_token}
    # print(headers)
    if post_:
        post(BASE_URL + endpoint, headers=headers)
    if put_:
        put(BASE_URL + endpoint, headers=headers)
    
    response = get(BASE_URL + endpoint,{}, headers=headers)
    # print(response)
    try:
        return response.json()
    except:
        return {'error': 'Request error'}


def spotify_callback(request,format=None):
    code = request.GET.get('code')
    error = request.GET.get('error')

    response = post('https://accounts.spotify.com/api/token', data={
        'grant_type': 'authorization_code',
        'code': code,
        'redirect_uri': REDIRECT_URI,
        'client_id': CLIENT_ID,
        'client_secret': CLIENT_SECRET,
    }).json()

    access_token = response.get('access_token')
    token_type = response.get('token_type')
    refresh_token = response.get('refresh_token')
    expires_in = response.get('expires_in')
    error = response.get('error')
    
    expires_in = timezone.now() + timedelta(seconds=expires_in)

    if not request.session.exists(request.session.session_key):
        request.session.create()
    session_id = request.session.session_key

    token = SpotifyToken.objects.update_or_create(
        user = session_id,
        defaults={
        'refresh_token': refresh_token,
        'access_token': access_token,
        'expires_in' : expires_in,
        'token_type': token_type }
    )

    return redirect('frontend:')

def is_account_auth(session_id):
    user_token = SpotifyToken.objects.filter(user = session_id)

    if user_token.exists():
        token =user_token[0]
        expiry = token.expires_in
        if expiry <= timezone.now():
            print("Refresh account token")
            refresh__account_token(session_id)
        return True
    return False

def refresh__account_token(session_id):
    
    refresh_token = SpotifyToken.objects.filter(user = session_id)[0].refresh_token

    response = post('https://accounts.spotify.com/api/token', data={
        'grant_type': 'refresh_token',
        'refresh_token': refresh_token,
        'client_id': CLIENT_ID,
        'client_secret': CLIENT_SECRET
    }).json()

    access_token = response.get('access_token')
    token_type = response.get('token_type')
    expires_in = response.get('expires_in')
    refresh_token = response.get('refresh_token')

    expires_in = timezone.now() + timedelta(seconds=expires_in)

    if refresh_token:  #  refresh_token might be returned
        defaults_values = {
        'refresh_token': refresh_token,
        'access_token': access_token,
        'expires_in' : expires_in,
        'token_type': token_type 
        }
    else:
        defaults_values = {
        'access_token': access_token,
        'expires_in' : expires_in,
        'token_type': token_type 
        }
        
    token = SpotifyToken.objects.update_or_create(
        user = session_id,
        defaults=defaults_values
    )

