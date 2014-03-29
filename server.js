var express = require('express.io')
var app = express();
var fs = require('fs');

app.http().io();

app.listen(8080);

app.configure(function() {
    app.use(express.static(__dirname + '/public'));         // set the static files location /public/img will be /img for users
    app.use(express.logger('dev'));                         // log every request to the console
    app.use(express.bodyParser());                          // pull information from html in POST
    app.use(express.methodOverride());                      // simulate DELETE and PUT
});

function serve_json(path, res) {
    res.set('Content-Type', 'application/json');
    res.set('charset', 'utf-8');
    res.charset = 'utf8';
    fs.readFile(path, 'utf8', function(err, data) {
        if (err) {
            console.log(err);
            res.send('not-found');
        } else {
            res.send(data);            
        }
    });
}

function serve_html(path, res) {
    fs.readFile(path, 'utf8', function(err, data){
        if (err) {
            console.log(err);
            res.send('404 Not Found'); //todo: actually set 404
        } else {
            res.send(data);
        }
    });
}

app.get('/', function(req, res) {
    serve_html('index.html', res);
});

app.get('/description/:pid', function(req, res){
    var path = 'data/problems/' + req.params.pid + '/description.html';
    serve_html(path, res);
});

app.get('/description/:pid/static/:static', function(req, res) {
    res.send('not implemented yet ' + req.params.pid + req.params.static);
});

app.get('/problems/:cid', function(req, res) {
    var path = 'data/contests/' + req.params.cid + '/problems.json';
    serve_json(path, res);
});

app.get('/contestants/:cid', function(req, res) {
    var path = 'data/contests/' + req.params.cid + 'contestants.json';
    serve_json(path, res);
});

app.get('/contests/:uid', function(req, res) {
    var path = 'data/users/' + req.params.uid + '.json';
    serve_json(path, res);
});

app.io.route('submit', function(req) {
    console.log(req.data);

    var path = 'submissions/' + [req.data.cid, req.data.pid, req.data.uid].join('_');

    fs.writeFile(path, req.data.source , function(err) {
        if (err) {
            console.log(err);
        } else {
            console.log("The file was saved!");
        }
    }); 

    req.io.emit('talk', "hello");
});

//console.log("App listening on port 8080");