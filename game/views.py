import json

from django.shortcuts import render
from django.contrib.auth.decorators import login_required
from game.models import Game
from django.http import HttpResponse, HttpResponseRedirect
from django.views.decorators.csrf import csrf_exempt

# Create your views here.
@login_required
def index(request):
    return render(request, 'index.html')


# this view must be csrf exempted to be able to accept XMLHttpRequests
@csrf_exempt
def save_game(request):
    if request.method == 'POST':
        msg_obj = json.loads(request.body.decode('utf-8'))
        print(msg_obj)
        try:
            msg = Game.objects.create(gameId=msg_obj['gameId'], player1=msg_obj['player1'], player2=msg_obj['player2'], winner = msg_obj['winner'], history = msg_obj['history'], note =msg_obj['note'] )
            msg.save()
        except Exception as ex:
            print("error saving game: %s" % ex)
        return HttpResponse("success")
    else:
        return HttpResponseRedirect('/')
