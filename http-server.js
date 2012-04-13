var static = require('node-static'),
    fileServer = new static.Server();

require('http').createServer(function (request, response) {
    request.addListener('end', function () {
        fileServer.serve(request, response);
    });
}).listen(8080);