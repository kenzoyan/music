from operator import length_hint
from venv import create
from django.db import models
import string
import random
# Create your models here.

def generate_unique_code():
    length = 6

    while True:
        code = ''.join(random.choices(string.ascii_uppercase,k=length))
        if not Room.objects.filter(code=code).exists():
            break
    print('Generate success')
    return code


class Room(models.Model):
    code = models.CharField(max_length=10,default=generate_unique_code,unique=True)
    host = models.CharField(max_length=100,unique=True)
    guest_pause = models.BooleanField(null=False,default=False)
    votes_to_skip = models.IntegerField(null=False,default=1)
    create_at = models.DateTimeField(auto_now_add=True)