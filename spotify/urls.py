from django.urls import path

from .views import AuthURL, IsAuth, spotify_callback

app_name = 'spotify'

urlpatterns = [
    path('get-auth-url', AuthURL.as_view()),
    path('is-auth', IsAuth.as_view()),
    path('redirect',spotify_callback),
]