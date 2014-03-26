var express  = require('express');
var fs = require('fs');

var app  = express();

app.configure(function() {
    app.use(express.static(__dirname + '/public'));         // set the static files location /public/img will be /img for users
    app.use(express.logger('dev'));                         // log every request to the console
    app.use(express.bodyParser());                          // pull information from html in POST
    app.use(express.methodOverride());                      // simulate DELETE and PUT
});

app.get('/description/:pid', function(req, res){
    var filename = 'data/' + req.params.pid + '/description.html';
    fs.readFile(filename, 'utf8', function(err, data){
        res.send(data);
    });
});

app.listen(8080);
console.log("App listening on port 8080");