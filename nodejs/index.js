var http = require('http').createServer().listen(4000);
var io = require('socket.io')(http);

// host of the server
var host = 'localhost';
var port = '8000';

//set users
var games = [];
var waitingUsers = {};
var users = {};


io.on('connection', function (socket) {

    //set user
    socket.on('login', function (msg) {
        socket.username = msg;
        console.log(socket.username + ' connect');
        socket.emit('login', Object.keys(waitingUsers));

        users[socket.username] = socket;
        waitingUsers[socket.username] = socket;

        socket.broadcast.emit('joinlobby', socket.username);
    });
    socket.on('invite', function (msg) {
        console.log('got an invite from: ', msg);

        socket.broadcast.emit('leavelobby', socket.username);
        socket.broadcast.emit('leavelobby', msg);

        delete waitingUsers[socket.username];
        delete waitingUsers[msg];


        var oppDict = {};
        oppDict[msg] = socket.username;
        oppDict[socket.username] = msg;

        var setColorUser = {};
        setColorUser[socket.username] = 'white';
        setColorUser[msg] = 'black';
        setColorUser['white'] = socket.username;
        setColorUser['black'] = msg;

        var game = {
            Id: Math.floor((Math.random() * 100) + 1),
            oppDict: oppDict,
            setColorUser: setColorUser
        };

        socket.gameId = game.Id;
        users[msg].gameId = game.Id;

        console.log('starting game: ' + game.Id);
        socket.emit('joingame', { game: game });
        users[msg].emit('joingame', { game: game });

        games.push(game);
    });


    //send the move of pice
    socket.on('move', function (msg) {
        socket.broadcast.emit('move', msg);
    });

    socket.on('disconnect', function () {
        console.log(socket.username + ' disconnected');

        removeGame(socket.gameId);

        socket.broadcast.emit('logout', {
            username: socket.username,
            gameId: socket.gameId
        });
    });

    var removeGame = function (id) {
        console.log("removing game: " + id);

        for (var i = 0; i < games.length; i++) {
            if (games[i].id === id) {
                games.splice(i, 1);
                console.log("removed it.")
            }
        }
    }
});