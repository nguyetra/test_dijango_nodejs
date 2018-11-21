// host of the server
var host = 'localhost';
var nodejs_port = '4000';

var game, board, socket, playerColor, nameColor;
var  checkLogout = '';

$(function () {
    socket = io(host + ':' + nodejs_port);

    //////////////////////////////
    // Socket.io handlers
    ////////////////////////////// 

    socket.on('login', function (msg) {
        usersOnline = msg;
        updateUserList();
    });

    socket.on('joinlobby', function (msg) {
        usersOnline.push(msg);
        updateUserList();
    });

    socket.on('leavelobby', function (msg) {
        for (var i = 0; i < usersOnline.length; i++) {
            if (usersOnline[i] === msg) {
                usersOnline.splice(i, 1);
            }
        }
        updateUserList();
    });

    //start game with color user
    socket.on('joingame', function (msg) {
        nameColor = msg.game.setColorUser;
        playerColor = nameColor[username];
        initGame();
        updateStatus();
        console.log(msg.game.oppDict);
        oppDict = msg.game.oppDict[username];
        $('#opponentname').append(oppDict);
        $('#page-lobby').hide();

    });

    //draw board with new move
    socket.on('move', function (msg) {
        game.move(msg);
        board.position(game.fen());
        updateMoveHistory(msg);
        updateStatus();

    });
    
    socket.on('logout', function (msg) {
        checkLogout = msg.username;
        winner = msg.username !==  username ? username : msg.username,

        msgObject = {
            winner = winner,    
            history = game.history(),
            note = checkLogout + 'is quitted'
        };
        socket.emit('endgame', msgObject)
        
        game = null;
        board.destroy();
        socket.disconnect();
        
        updateStatus();
    });

    //////////////////////////////
    // Menus
    ////////////////////////////// 
    username = $('#username').val();
    socket.emit('login', username);
    console.log('user ', username);
    $('#page-lobby').show();

    var updateUserList = function () {
        document.getElementById('userList').innerHTML = '';
        usersOnline.forEach(function (user) {
            $('#userList').append($('<button>')
                .text(user)
                .on('click', function () {
                    socket.emit('invite', user);
                }));
        });
    };
});


var initGame = function () {

    var cfg = {
        draggable: true,
        position: 'start',
        orientation: playerColor,
        onDragStart: onDragStart,
        onDrop: onDrop,
        onMouseoutSquare: onMouseoutSquare,
        onMouseoverSquare: onMouseoverSquare,
        onSnapEnd: onSnapEnd
    };
    game = new Chess();
    board = new ChessBoard('board', cfg);
    statusEl = $('#status');
    historyElement = $('#move-history');
    updateStatus();
}

var onDragStart = function (source, piece, position, orientation) {
    if (game.game_over() === true ||
        (game.turn() === 'w' && piece.search(/^b/) !== -1) ||
        (game.turn() === 'b' && piece.search(/^w/) !== -1) ||
        (game.turn() !== playerColor[0])) {
        return false;
    }
};

//show status
var updateStatus = function () {
    if (checkLogout === '') {
        var status = '';

        var moveUser = nameColor['white'];
        if (game.turn() === 'b') {
            moveUser = nameColor['black'];
        }

        if (game.in_checkmate() === true) {
            status = 'Game over, ' + moveUser + ' is in checkmate.';
        }

        else if (game.in_draw() === true) {
            status = 'Game over, drawn position';
        }

        else {
            status = moveUser + ' to move';


            if (game.in_check() === true) {
                status += ', ' + moveUser + ' is in check';
            }
        }
    }
    else {
        var status = 'Game over, you win,  ' + checkLogout + ' is quitted.';
    }
    statusEl.html(status);
};

var updateMoveHistory = function (lastMove) {
    historyElement.append('<tr>' + '<td>' + lastMove['from'] + '</td>' + '<td>' + lastMove['to'] + '</td>' + '<td>' + lastMove['piece'] + '</td>' + '</tr>');
};

var onDrop = function (source, target) {

    removeGreySquares();

    // see if the move is legal
    var move = game.move({
        from: source,
        to: target,
        promotion: 'q' // NOTE: always promote to a queen for example simplicity
    });

    // illegal move
    if (move === null) {
        return 'snapback';
    } else {
        socket.emit('move', move);
        updateMoveHistory(move);
    }
    updateStatus();
};

// update the board position after the piece snap 
// for castling, en passant, pawn promotion
var onSnapEnd = function () {
    board.position(game.fen());
};

var onMouseoverSquare = function (square, piece) {
    if (game.turn() === playerColor[0]) {
        var moves = game.moves({
            square: square,
            verbose: true
        });

        if (moves.length === 0) return;

        greySquare(square);

        for (var i = 0; i < moves.length; i++) {
            greySquare(moves[i].to);
        }
    }
};

var onMouseoutSquare = function (square, piece) {
    removeGreySquares();
};

var removeGreySquares = function () {
    $('#board .square-55d63').css('background', '');
};

var greySquare = function (square) {
    var squareEl = $('#board .square-' + square);

    var background = '#a9a9a9';
    if (squareEl.hasClass('black-3c85d') === true) {
        background = '#696969';
    }

    squareEl.css('background', background);
};