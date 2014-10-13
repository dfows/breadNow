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

// global variable and references to DOM elements
var pageNum = 0;
var $orderForm = $('#form');
var $msg = $('#msg').hide();

// form templates
var form0 = generateOrderForm();
var form1 = generateShippingForm();
var form2 = generatePaymentForm();
var formTemplates = [form0,form1,form2];

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
  if (!localStorage['order']) { localStorage['order'] = JSON.stringify({}); }
  var order = JSON.parse(localStorage['order']);
  for (var key in params) {
    order[key] = params[key];
  }
  localStorage['order'] = JSON.stringify(order);
}

// submit order
function finalizeOrder() {
  $.ajax({
    url: '/placeOrder',
    data: localStorage['order'],
    type: 'POST',
    success: function() {
      console.log("yep");
      $form.hide();
      $msg.text('Thanks for your order').show();
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
      var bObj = JSON.parse(b).responseText;
      var breadName = bObj.breadName;
      var breadPrice = bObj.breadPrice.toFixed(2);
      $bread.text(breadName);
      $price.text("$"+breadPrice);
    },
    error: function() {
      console.log("could not get bread");
    }
  });

  $continue[0].onclick = function() {
    var obj = {bread: $bread.text(),
               price: $price.text(),
               number: $number.val()};
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

  //generate a template for page 1 of form?
  var $form = $('<form>');
  var $name = $('<input class="input" type="text">').attr('name','customer-name').attr('placeholder','FULL NAME').val(name);
  var $strAddr1 = $('<input class="input" type="text">').attr('name','customer-addr1').attr('placeholder','STREET ADDRESS 1').val(strAddr1);
  var $strAddr2 = $('<input class="input" type="text">').attr('name','customer-addr2').attr('placeholder','STREET ADDRESS 2 (optional)').val(strAddr2);
  var $zip = $('<input class="input" type="text">').attr('name','customer-zip').attr('placeholder','ZIP CODE').val(zipC);
  var $back = $('<a>').addClass('btn btn-lg').text('prev');
  var $continue = $('<a>').addClass('btn btn-lg').text('next');

  $back[0].onclick = function() {
    prevPage();
  };
  $continue[0].onclick = function() {
    var obj = {name: $name.val(),
                    strAddr1: $strAddr1.val(),
                    strAddr2: $strAddr2.val(),
                    zip: $zip.val()};
    updateOrder(obj);
    nextPage();
  };

  $form.append($name).append($strAddr1).append($strAddr2).append($zip).append($back).append($continue); 
  return $form;
}

function generatePaymentForm() {
  var $form = $('<form>');
  var $back = $('<a>').addClass('btn btn-lg').text('prev');
  var $continue = $('<a>').addClass('btn btn-lg').text('next');
  
  $back[0].onclick = function() {
    prevPage();
  };
  $continue[0].onclick = function() {
    var obj = {name: $name.val(),
                    strAddr1: $strAddr1.val(),
                    strAddr2: $strAddr2.val(),
                    zip: $zip.val()};
    updateOrder(obj);
    finalizeOrder();
  };

  $form.append($back).append($continue); 
  return $form;
}
