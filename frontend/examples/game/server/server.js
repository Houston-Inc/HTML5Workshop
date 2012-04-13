var io = require('socket.io').listen(3000),
    exec = require('child_process').exec;

var currentQuestion = undefined,
    masterClient = undefined,
    questionProxy = undefined,
    points = {},
    players = -1,
    questions = [{
        'question': 'Barks',
        'answer': 'dog'
    },{
        'question': 'Sails',
        'answer': 'boat'
    },{
        'question': 'Meows',
        'answer': 'cat'
    },{
        'question': 'Uppercase',
        'answer': 'lowercase'
    },{
        'question': '<span style="background-color: orange">Syntax</span>',
        'answer': 'hilight'
    },{
        'question': 'Foo',
        'answer': 'bar'
    },{
        'question': 'Beats &',
        'answer': 'styles'
    },{
        'question': 'Demo',
        'answer': 'scene'
    }];


var startNewGame = function() {
    questionProxy = questions.slice();
    currentQuestion = undefined;
    points = {};
    if(masterClient !== undefined) masterClient.emit('questionCount', { questionCount: questionProxy.length });
    startNewRound();
}

var startNewRound = function() {
    if(questionProxy.length > 0) {
        currentQuestion = questionProxy.pop();
        io.sockets.emit('question', { question : currentQuestion.question });
    } else {
        setTimeout(function() {
            repeatCorrectAnswer("game over");
            //TODO: announceWinner();
        }, 5000);
        io.sockets.emit('gameOver');
    }
}

var repeatCorrectAnswer = function(answer) {
    exec('say "' + answer + '"');
}

//io.set('log level', 1);
io.sockets.on('connection', function (client) {
    players++;
    if(masterClient !== undefined) masterClient.emit('playerConnected', { id: client.id, playerCount: players });
    client.points = 0;
    io.sockets.emit('playerCount', { players: players });

    client.on('masterClient', function(data) {
        masterClient = client;
    });

    client.on('name', function(data) {
        client.name = data.name;
        if(masterClient !== undefined) masterClient.emit('playerName', { id: client.id, name: client.name });
    });

    client.on('startNewGame', function(data) {
        if(masterClient !== undefined && masterClient.id == client.id) startNewGame();
    });

    client.on('startNewRound', function(data) {
        if(masterClient !== undefined && masterClient.id == client.id) startNewRound();
    });

    client.on('answer', function(data) {
        if(currentQuestion !== undefined && data.answer == currentQuestion.answer) {
            repeatCorrectAnswer(data.answer);
            client.points++;
            if(masterClient !== undefined) masterClient.emit('playerPoints', { id: client.id, points: client.points });
            startNewRound();
        }
    });

    client.on('disconnect', function() {
        players--;
        io.sockets.emit('playerCount', { players: players });
        if(masterClient !== undefined) masterClient.emit('playerDisconnected', { id: client.id });
    });
});

