function supports_html5_storage() {
  try {
    return 'localStorage' in window && window['localStorage'] !== null;
  } catch (e) {
    return false;
  }
}
if (!supports_html5_storage) {
  console.log("kill yourself; get HTML5 compatible browser");
}

Stripe.setPublishableKey('pk_test_XsWkTrpW4aniRIusa3BoQqb6');
// global variable and references to DOM elements
var pageNum = 0;
var token;
var $orderForm = $('#form');
var $msg = $('#msg').hide();
if (!localStorage['order']) { localStorage['order'] = JSON.stringify({}); }

// form templates
var form0 = generateOrderForm();
var form1 = generateShippingForm();
var form2 = generatePaymentForm();
var form3 = generateConfirmationPage();
var formTemplates = [form0,form1,form2,form3];

// display forms
function prevPage() {
  pageNum = pageNum > 0 ? pageNum-1 : 0;
  showPage();
}
function nextPage() {
  pageNum = pageNum < formTemplates.length-1 ? pageNum+1 : formTemplates.length-1;
  showPage();
}
function showPage() {
  $orderForm.empty().append(formTemplates[pageNum]);
}

// save after changing forms
function updateOrder(params) {
  var order = JSON.parse(localStorage['order']);
  for (var key in params) {
    order[key] = params[key];
  }
  localStorage['order'] = JSON.stringify(order);
}

// review order
function reviewOrder() {
  return JSON.parse(localStorage['order']);
}

// submit order
function finalizeOrder() {
  var orderObj = {};
  var order = JSON.parse(localStorage['order']);
  for (var key in order) {
    orderObj[key] = order[key];
  }
  orderObj['cardToken'] = token;
  $.ajax({
    url: '/charge',
    data: JSON.stringify(orderObj),
    type: 'POST',
    success: function(d) {
      var successText = JSON.parse(d).responseText;
      $orderForm.hide();
      $msg.text(successText).show();
    },
    error: function() {
      console.log("nope");
    },
  });
}

// FORMS

function generateOrderForm() {
  var numLoaves = JSON.parse(localStorage['order']).number || 0;

  var $form = $('<form>');
  var $bread = $('<div>').addClass('bread-of-day');
  var $price = $('<div>').addClass('bread-price');
  var $number = $('<input class="input" type="number">').attr('name','numLoaves').val(numLoaves);
  var $continue = $('<a>').addClass('btn btn-lg').text('next');

  $.ajax({
    url: '/getBread',
    success: function(b) {
      var bObj = JSON.parse(JSON.parse(b).responseText);
      var breadName = bObj.name;
      var breadPrice = bObj.price.toFixed(2);
      $bread.text(breadName);
      $price.text("$"+breadPrice);
    },
    error: function() {
      console.log("could not get bread");
    }
  });

  $continue[0].onclick = function() {
    var obj = {bread: $bread.text(),
               price: $price.text().slice(1), //dont want that dolla sign
               number: $number.val()};
    console.log("THE PRICE IS RIGHT",obj.price);
    updateOrder(obj);
    nextPage();
  };

  $form.append($bread).append($price).append($number).append($continue);
  return $form;
}

function generateShippingForm() {
  var name = JSON.parse(localStorage['order']).name || "";
  var strAddr1 = JSON.parse(localStorage['order']).strAddr1 || "";
  var strAddr2 = JSON.parse(localStorage['order']).strAddr2 || "";
  var zipC = JSON.parse(localStorage['order']).zip || "";
  var phone = JSON.parse(localStorage['order']).phone || "";

  //generate a template for page 1 of form?
  var $form = $('<form>');
  var $name = $('<input class="input" type="text">').attr('name','customer-name').attr('placeholder','FULL NAME').val(name);
  var $strAddr1 = $('<input class="input" type="text">').attr('name','customer-addr1').attr('placeholder','STREET ADDRESS 1').val(strAddr1);
  var $strAddr2 = $('<input class="input" type="text">').attr('name','customer-addr2').attr('placeholder','STREET ADDRESS 2 (optional)').val(strAddr2);
  var $zip = $('<input class="input" type="text">').attr('name','customer-zip').attr('placeholder','ZIP CODE').val(zipC);
  var $phone = $('<input class="input" type="text">').attr('name','customer-phone').attr('placeholder','PHONE').val(phone);
  var $back = $('<a>').addClass('btn btn-lg').text('prev');
  var $continue = $('<a>').addClass('btn btn-lg').text('next');

  $back[0].onclick = function() {
    prevPage();
  };
  $continue[0].onclick = function() {
    var obj = {name: $name.val(),
                    strAddr1: $strAddr1.val(),
                    strAddr2: $strAddr2.val(),
                    zip: $zip.val(),
                    phone: $phone.val()};
    updateOrder(obj);
    nextPage();
  };

  $form.append($name).append($strAddr1).append($strAddr2).append($zip).append($phone).append($back).append($continue); 
  return $form;
}

function generatePaymentForm() {
  var $form = $('<form>');
  var $cardNum = $('<input class="input" type="text" size="16">').attr('name','card-number').attr('placeholder','XXXXXXXXXXXXXXXX');
  var $cardCVC = $('<input class="input" type="text">').attr('name','card-cvc').attr('placeholder','cvc');
  var $expMo = $('<input class="input" type="text" size="2">').attr('name','card-exp-mo').attr('placeholder','MM');
  var $expYr = $('<input class="input" type="text" size="2">').attr('name','card-exp-yr').attr('placeholder','YY');
  var $back = $('<a>').addClass('btn btn-lg').text('prev');
  var $continue = $('<a>').addClass('btn btn-lg').text('next');

  /* TESTING */
  $cardNum.val('4242424242424242');
  $cardCVC.val('123');
  $expMo.val('01');
  $expYr.val('16');
  
  $back[0].onclick = function() {
    prevPage();
  };
  $continue[0].onclick = function() {
    // stripe token to create and store cc token
    Stripe.card.createToken({
      number: $cardNum.val(),
      cvc: $cardCVC.val(),
      exp_month: $expMo.val(),
      exp_year: $expYr.val()
    }, function(err, response) {
      if (err) { console.log(err); }
      console.log("sup token",response.id);
      token = response.id;
    });
    nextPage();
  };

  $form.append($cardNum).append($cardCVC).append($expMo).append($expYr).append($back).append($continue); 
  return $form;
}

function generateConfirmationPage() {
  var $form = $('<form>');
  var $details = $('<div>');
  var $back = $('<a>').addClass('btn btn-lg').text('prev');
  var $continue = $('<a>').addClass('btn btn-lg').text('next');

  var order = reviewOrder();
  for (var key in order) {
    var val = (key === 'price') ? '$'+order[key] : order[key];
    var $field = $('<div>').addClass('order-detail').text(key+': '+val);
    $details.append($field);
  }
  
  $back[0].onclick = function() {
    prevPage();
  };
  $continue[0].onclick = function() {
    console.log("sup");
    finalizeOrder();
  };

  $form.append($details).append($back).append($continue); 
  return $form;
}
