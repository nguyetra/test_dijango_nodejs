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
    # if the request method is a POST request
    if request.method == 'POST':
        # content sent via XMLHttpRequests can be accessed in request.body
        # and it comes in a JSON string, that's why we use json library to
        # turn it into a normal dictionary again
        msg_obj = json.loads(request.body.decode('utf-8'))

        # tries to create the message and save it in the db
        try:
            msg = Message.objects.create(gameId=msg_obj['gameId'], player1=msg_obj['player1'], player2=msg_obj['player2'], winner = msg_obj['winner'], history = msg_obj['history'])
            msg.save()
        # if some error occurs it will print the error in the django console and return a HttpResponse
        # containing a error value, which will be received by nodejs socket.io
        except:
            print("error saving game")
            return HttpResponse("error")

        # if there aren't any errors, it returns a HttpResponse containing a success value, which will
        # be received by nodejs socket.io
        return HttpResponse("success")

    # if it is a GET request (someone trying to access to the link or something)
    # returns to the main page without doing anything
    else:
        return HttpResponseRedirect('/')
