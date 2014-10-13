var express = require('express');
var path = require('path');
var body = require('body/json');

var app = express();

app.post('/placeOrder', function(req,res) {
  // this is me putting an order into the db
  // the full order
  body(req,res,function(err,stuff) {
    console.log(stuff);
    res.end(JSON.stringify({status:200,responseText:stuff}));
  });
});

app.get('/reviewOrder', function(req,res) {
  // this is me returning the order for review
  res.end(JSON.stringify({status:200,responseText:"tyhis is your order"}));
});

app.get('/getBread', function(req,res) {
  /*
  db.breads.findOne({},function(err,result) {
    var breadObj = {};
    breadObj['name'] = result.name;
    breadObj['price'] = result.price;
    res.end(JSON.stringify({status:200,responseText:JSON.stringify(breadObj)}));
    //return most recent bread
  });
  */
  var breadObj = {breadName:"sweet batard",breadPrice:5.5};
  res.end(JSON.stringify({status:200,responseText:breadObj}));
});

app.use(express.static(path.join(__dirname, 'public')));
var port = process.env.PORT || 8002;
app.listen(port)
