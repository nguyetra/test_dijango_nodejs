from django.db import models

# Create your models here.
class Game(models.Model):
    gameId = models.PositiveIntegerField(primary_key = True)
    player1 = models.CharField(max_length = 10)
    player2 = models.CharField(max_length = 10)
    winner = models.CharField(max_length = 10)
    history = models.TextField()
    note = models.CharField(max_length = 150)