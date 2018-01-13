const express = require('express');
const exphbs = require('express-handlebars');
const path = require('path');
const bodyParser = require('body-parser');
const redis = require('redis');

// Create Redis Client
let client = redis.createClient();

client.on('connect', function(){
  console.log('Connected to Redis...');
});

// Set LEET Port
const port = 1337;

// Init app
const app = express();

// View Engine
app.engine('handlebars', exphbs({defaultLayout:'main'}));
app.set('view engine', 'handlebars');

// body-parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:false}));

// Main Search Page
app.get('/', function(req, res, next){
  res.render('searchbox');
});


// Search User processing
app.post('/user/search', function(req, res, next){
  let userId = req.body.userId;

  client.hgetall("accounts:"+userId+":args", function(err, obj){
    if(!obj){
      res.render('searchbox', {
        error: 'User does not exist'
      });
    } else {
      obj.userId = userId;
      res.render('userDetails', {
        user: obj
      });
    }
  });
});

// Search Doc processing
app.post('/doc/search', function(req, res, next){
  let docId = req.body.docId;

  client.hgetall(docId, function(err, obj){
    if(!obj){
      res.render('searchbox', {
        error: 'Doc does not exist'
      });
    } else {
      obj.docId = docId;
      
      res.render('docDetails', {
        user: obj
      });
    }
  });
});


app.listen(port, function(){
  console.log('Server started on port '+port);
});
