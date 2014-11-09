var express = require('express');
var path = require('path');
var body = require('body/json');
var mongo = require('mongodb');
var monk = require('monk');
var stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
var twilio = require('twilio')(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

var db = monk('mongodb://jessica:what@kahana.mongohq.com:10069/asdf');
var table_breads = db.get('breads');
var table_orders = db.get('orders');
var app = express();

app.get('/getBread', function(req,res) {
  table_breads.findOne({},{fields: {_id:0}},function(err,breadObj) {
    if (err) { logError(err);}
    res.end(JSON.stringify({status:200,responseText:JSON.stringify(breadObj)}));
  });
});

app.post('/charge', function(req,res) {
  body(req,res,function(err,order) {
    var breadPrice = parseInt(order.number)*parseFloat(order.price)*100;
    console.log("charging u diz much",breadPrice);
    stripe.charges.create({
      amount: breadPrice,
      currency: "usd",
      card: order.cardToken, // obtained with Stripe.js
      description: "Charge for bread"
    }, function(err, charge) {
      if (err) { res.send(err); }
      delete order.cardToken;
      order['status'] = 'pending';
      var datePlaced = new Date();
      order['datePlaced'] = datePlaced.toUTCString();
      placeOrder(order, function() {
        sendReceipt(order);
        res.end(JSON.stringify({status:200,responseText:"Order successfully placed at "+datePlaced.toString()+". Thank you!"}));
      });
    });
  });
});

function placeOrder(order, callback) {
  // this is me putting an order into the db
  table_orders.insert(order,function(err,result) {
    if (err) { logError(err);}
    console.log("wat",result);
    callback();
  });
}

function sendReceipt(order) {
  // text receipt to a person
  twilio.sendMessage({
    to:'+1'+order.phone,
    from: process.env.TWIL_NUM,
    body: 'Thanks for your order! Bread is on its way. Text this number to check ETA.'

  }, function(err, responseData) {
    if (!err) { // "err" is an error received during the request, if any
        console.log(responseData.from);
        console.log(responseData.body);
    }
  });
}

function logError(err) {
  console.log("error:",err);
}

app.use(express.static(path.join(__dirname, 'public')));
var port = process.env.PORT || 8002;
app.listen(port)
