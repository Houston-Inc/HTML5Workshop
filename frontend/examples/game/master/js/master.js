window.MasterClient = function() {
    var self = this;
    self.server = location.hostname;
    self.port = 3000;

    self.$main = $("#main");

    self.playerCount = 0;

    self.socket = io.connect('http://' + self.server + ':' + self.port),
    self.socket.emit('masterClient');

    self.socket.on('playerConnected', function(data) {
        self.playerConnected(data);
    });
    self.playerConnected = function(data) {
        var $player = $(
            '<div id="' + data.id + '" class="player" style="background-color: ' + 
            self.getRandomColor() + ';">Player ' + data.playerCount + '</div>'
        );
        self.$main.append($player);
    };

    self.socket.on('playerCount', function(data) {
        self.playerCount = data.players;
        $("#players").text(data.players);
    });

    self.socket.on('playerName', function(data) {
        $("#" + data.id).text(data.name);
    });

    self.socket.on('playerPoints', function(data) {
        $("#" + data.id).text(data.name);
    });

    self.socket.on('playerDisconnected', function(data) {
        $("#" + data.id).remove();
    });


    $("#new-game").click(function() {
        console.log("new game");
        self.socket.emit('startNewGame');
    });

    $("#new-round").click(function() {
        console.log("new round");
        self.socket.emit('startNewRound');
    });

    self.getRandomColor = function() {
        var colors = [];
        for(var a = 0; a < 3; a++) { colors.push(parseInt(Math.random()*155, 10)+100); }
        return "rgb(" + colors.join(",") + ")";
    }
};

var mc = new MasterClient();
