#!/bin/env node

var http       = require('http'),
    mysql      = require('mysql'),
    crypto     = require('crypto'),
    express    = require('express'),
    bodyParser = require("body-parser");


// sudo npm install --save body-parser

var db = mysql.createConnection({
  host     : "127.0.0.1",
  user     : "tmp",
  password : "password",
  database : 'stacs'
});

db.connect(function(err) {
  if (err) { 
    console.error('Error connecting to db');
    console.error(err);
    return;
  }
  console.log('Database connected');
});

app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get('/', function (req, res) {
  res.sendfile(__dirname + '/form.html');
});
app.get('/ok', function (req, res) {
  res.send('Ok, you are now logged in');
});
app.get('/error', function (req, res) {
  res.send('Error: incorrect password');
});
app.get('/new', function (req, res) {
  res.send('Ok, you are now registered');
});

app.post('/', function (req, res) {
  var email = req.body.email.split('@')[0];
  var pass  = req.body.password;

  if(req.body.email.split('@')[1].indexOf('gmu.edu') == -1) {
    console.log('Not a mason email');
    // TODO redirect
  }

  // TODO escape mysql
  var q1 = "SELECT * FROM `users` WHERE `email` = \'"+email+"\'";
  console.log(q1);
  db.query(q1, function (error, results, fields) {
    if(results.length == 0) {
      var slt = crypto.randomBytes(12).toString('base64');
      var pwd = crypto.createHash('sha256').update(slt).update(pass).digest('base64');
      // TODO escape mysql
      var q2  = "INSERT INTO users (email,pass,salt) VALUES(\'"+email+"\',\'"+pwd+"\',\'"+slt+"\')";
      console.log(q2);
      db.query(q2, function (error, results, fields) {
        if (error) throw error;
        console.log(results);
      });
      res.redirect('/new');
      return;
    }
    var slt = results[0].salt;
    var pwd = crypto.createHash('sha256').update(slt);
        pwd = pwd.update(pass).digest('base64');
    if(results[0].pass !== pwd) {
      res.redirect('/error');
      return;
    }
    else {
      res.redirect('/ok');
      return;
    }
  });
});

app.listen(3000, function () {
  console.log('Example app listening on port 3000!')
});

