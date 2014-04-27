var express = require('express.io')
var app = express();
var fs = require('fs');
var exec = require('child_process').exec;
var util = require('util');
var helper = require('./helper');
var kue = require('kue');
var jobs = kue.createQueue();

app.http().io();

app.listen(8080);

app.configure(function() {
    app.use(express.static(__dirname + '/public'));         // set the static files location /public/img will be /img for users
    app.use(express.logger('dev'));                         // log every request to the console
    app.use(express.json());                                // pull information from html in POST
});

app.get('/', function(req, res) {
    console.log(helper);
    helper.serve_html('index.html', res);
});

app.get('/description/:pid', function(req, res){
    var path = 'data/problems/' + req.params.pid + '/description.html';
    helper.serve_html(path, res);
});

app.get('/description/:pid/static/:static', function(req, res) {
    res.send('not implemented yet ' + req.params.pid + req.params.static);
});

app.get('/contest_details/:cid', function(req, res) {
    var path = 'data/contests/' + req.params.cid + '.json';
    helper.serve_json(path, res);
});

app.get('/contests/:uid', function(req, res) {
    var path = 'data/users/' + req.params.uid + '.json';
    helper.serve_json(path, res);
});

app.get('/jquery.min.js', function(req, res) {
    helper.serve_html("jquery.min.js", res);
});

app.io.route('submit', function(req) {
    var job = jobs.create("grade", req.data);

    job.on('complete', function() {
        req.io.emit('talk', "graded successfully");
    });

    job.save();
});

kue.app.listen(3000);