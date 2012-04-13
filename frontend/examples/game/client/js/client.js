window.Client = function() {
    var self = this;
    self.server = location.hostname;
    self.port = 3000;
    self.socket = io.connect('http://' + self.server + ':' + self.port);

    self.$main = $("#main");
    self.$playerName = $("#player-name");
    self.$answer = $("#answer");

    self.socket.on('playerCount', function(data) {
        $("#players").text(data.players);
    });

    self.socket.on('question', function(data) {
        self.$main.html(data.question);
    });

    $("#player-name-form").submit(function(event) {
        event.preventDefault();
        self.$answer.focus();
        //var name = $("#player-name").val();
        //if(name.length > 0) self.socket.emit('name', { name: name });
    });

    self.$playerName.keyup(function(event) {
        event.preventDefault();
        var name = self.$playerName.val();
        if(name.length > 0) self.socket.emit('name', { name: name });
    });

    $("#answer-form").submit(function(event) {
        event.preventDefault();
        self.socket.emit('answer', { answer: self.$answer.val() });
        self.$answer.val("").focus();
    });

    self.$playerName.focus();

}
var c = new Client();