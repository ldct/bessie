var fs = require('fs');

exports.serve_json = function(path, res) {
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

exports.serve_html = function(path, res) {
    fs.readFile(path, 'utf8', function(err, data){
        if (err) {
            console.log(err);
            res.send('404 Not Found'); //todo: actually set 404
        } else {
            res.send(data);
        }
    });
}