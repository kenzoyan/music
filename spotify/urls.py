from django.urls import path

from .views import *

app_name = 'spotify'

urlpatterns = [
    path('get-auth-url', AuthURL.as_view()),
    path('is-auth', IsAuth.as_view()),
    path('redirect',spotify_callback),
    path('current-song',CurrentSong.as_view()),
    path('pause-song',PauseSong.as_view()),
    path('play-song',PlaySong.as_view()),
    path('skip-song',SkipSong.as_view()),
]