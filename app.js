var express = require('express');
var path = require('path');
var body = require('body/json');
var stripe = require('stripe')("sk_test_IsqqoxGSOG3a4lUaplTaNwh5");

var app = express();

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

app.post('/charge', function(req,res) {
  body(req,res,function(err,stuff) {
    var breadPrice = parseInt(stuff.number)*parseFloat(stuff.price)*100;
    console.log("charging u diz much",breadPrice);
    stripe.charges.create({
      amount: breadPrice,
      currency: "usd",
      card: stuff.cardToken, // obtained with Stripe.js
      description: "Charge for bread"
    }, function(err, charge) {
      if (err) { res.send(err); }
      placeOrder(stuff, function() {
        console.log("WAAAZZAAA");
        res.end(JSON.stringify({status:200,responseText:"yoooo"}));
      });
    });
  });
});

function placeOrder(stuff, callback) {
  // this is me putting an order into the db
  // the full order
  console.log("place order fn");
  callback();
  //db.orders.update(stuff,{upsert:true},function(err,res) {
    // send response back to browza and be like, boom u placed an order
  //});
}

function sendReceipt(stuff) {
  // email receipt to a person
}

app.use(express.static(path.join(__dirname, 'public')));
var port = process.env.PORT || 8002;
app.listen(port)
