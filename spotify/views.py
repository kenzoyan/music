from django.shortcuts import redirect
from .credentials import CLIENT_ID,CLIENT_SECRET, REDIRECT_URI
from rest_framework.views import APIView
from rest_framework import status
from rest_framework.response import Response
from django.utils import timezone
from datetime import timedelta
from requests import Request,post
from .models import  SpotifyToken

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

    token = SpotifyToken.objects.update_or_create(
        user = session_id,
        defaults={
        'refresh_token': refresh_token,
        'access_token': access_token,
        'expires_in' : expires_in,
        'token_type': token_type }
    )

