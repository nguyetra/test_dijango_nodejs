var http = require('http').createServer().listen(4000);
var io = require('socket.io')(http);
var XMLHttpRequest = require('xmlhttprequest').XMLHttpRequest;

// creating an instance of XMLHttpRequest
var xhttp = new XMLHttpRequest();

// host of the server
var host = 'localhost';
var port = '8000';

///////
var usernames = {};
var numUsers = 0;

// when a connection happens (client enters on the website)
io.on('connection', function(socket) {

    // if the event with the name 'message' comes from the client with the argument 'msgObject',
    // which is an object with the format: {'user_name': < name >, 'message': < message >},
    // it emits for every connected client that a message has been sent, sending the message to the event
    // 'getMessage' in the client side
    socket.on('message', function(msgObject) {
        // emits the msgObject to the client
        io.emit('getMessage', msgObject);

        // url of the view that will process
        var url = 'http://' + host +':' + port + '/save_message/';

        // when the request finishes
        xhttp.onreadystatechange = function() {
            // it checks if the request was succeeded
            if(this.readyState === 4 && this.status === 200) {
                // if the value returned from the view is error
                if(xhttp.responseText === "error")
                    console.log("error saving message");
                // if the value returned from the view is success
                else if(xhttp.responseText === "success")
                    console.log("the message was posted successfully");
            }
        };

        // prepares to send
        xhttp.open('POST', url, true);
        // sends the data to the view
        xhttp.send(JSON.stringify(msgObject));
    });


    //////////////////////
    console.log('a user is connected');
    
    socket.username =  "name "+Math.random();
    socket.color = numUsers < 1 ? 'white' : 'black';
    usernames[socket.username] = socket.username;
    ++numUsers;
    
    socket.emit('join', {
        color: socket.color
    })

    socket.broadcast.emit('user joined', {
      username: socket.username,
      color: socket.color,
      numUsers: numUsers
    });
    
    socket.on('move', function(msg) {
        socket.broadcast.emit('move', msg);
        console.log(msg);
    });


    socket.on('disconnect', function() {
        console.log('a user is disconnected');
         delete usernames[socket.username];
        --numUsers;

      socket.broadcast.emit('user left', {
        username: socket.username,
        numUsers: numUsers
      });
    });
});