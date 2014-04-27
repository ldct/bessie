/* 
** nodemon ./grader.js
** fetches and completes grading jobs from redis
*/
var kue = require('kue');
var jobs = kue.createQueue();
var crypto = require('crypto');
var util = require('util');
var fs = require('fs');
var child_process = require('child_process');
var exec = require('child_process').exec;

function execSync(command, opts) {
    child_process.exec(command + ' 2>&1 1>output && echo done! > done', opts);

    var cwd;
    if (opts) {
        cwd = opts.cwd ? opts.cwd : ".";
    } else {
        cwd = ".";
    } 
    while (!fs.existsSync(cwd + '/done')) {
        
    }
     
    var output = fs.readFileSync(cwd + '/output');
     
    fs.unlinkSync(cwd + '/output');
    fs.unlinkSync(cwd + '/done');
     
    return output;
}

function escape_newline(s) {
    return s.replace(/\n/g, "\\n");
}

function md5(s) {
    return crypto.createHash('md5').update(s).digest('hex');
}

function compiler(file_name) {
    file_name = file_name.split('.');
    var ext = file_name[file_name.length - 1];
    if (ext == "cpp") {
        return "g++";
    } else if (ext == "c") {
        return "gcc";
    }
}

jobs.process('grade', 1, function(job, done) {
  
    var hash = md5(job.data.source_code);
    var dir = util.format("submissions/%s_%s_%s", job.data.cid, job.data.pid, job.data.uid); //todo: add timestamp
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir);
    }
    var file_name = util.format("%s_%s", hash, job.data.file_name);
    var path = util.format("%s/%s", dir, file_name);
    fs.writeFileSync(path, job.data.source_code);

    var results = [];

    var tests = JSON.parse(fs.readFileSync(util.format("data/problems/%s/tests.json", job.data.pid)));

    execSync(util.format("%s -o %s.out %s", compiler(file_name), file_name, file_name), {'cwd': dir});
    for (var i in tests) {
        var t = tests[i];
        var stdout = execSync(util.format("%s.out < data/problems/%s/test_data/%s.in", path, job.data.pid, t.name));
        var ans = fs.readFileSync(util.format("data/problems/%s/test_data/%s.out", job.data.pid, t.name), 'utf8');
        if (ans == stdout) {
            job.log("test case %s ok", t.name);
            results.push("AC");
        } else {
            job.log("test case %s error: expected %s, got %s", t.name, escape_newline(ans), escape_newline(stdout));
            results.push(util.format("{'%s': ERR}", i)); //todo: catch MLE, TLE etc
        }
    }
    fs.writeFileSync(dir + "/results", results);
    console.log(results);
    done();
});