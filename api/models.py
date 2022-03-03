from venv import create
from django.db import models

# Create your models here.


class Room(models.Model):
    code = models.CharField(max_length=10,default='',unique=True)
    host = models.CharField(max_length=100,unique=True)
    guest_pause = models.BooleanField(null=False,default=False)
    votes_to_skip = models.IntegerField(null=False,default=1)
    create_at = models.DateTimeField(auto_now_add=True)