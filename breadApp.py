import os, datetime
from flask import * #Flask,render_template,session,redirect,url_for
from pymongo import MongoClient
import breads

app = Flask(__name__)
app.secret_key = 'asdf12345'

client = MongoClient(os.getenv('MONGOHQ_URL'))
database = client.dailyBread
breadbox = breads.Breads(database)

@app.route('/quantity')
def select_quant():
  session['breading'] = True
  bread_of_week = breadbox.get_bow()
  session['bread'] = bread_of_week
  return render_template("quantity.html", flavorName = bread_of_week) 

@app.route('/delivery-info/<q>')
def enter_info(q):
  print "q is", q
  session['quantity'] = q
  return render_template("delivery-info.html")

@app.route('/payment', methods=['POST'])
def make_payment():
  error = None
  if request.method == 'POST': 
    session['address'] = request.form['delivery-address']
    session['phone'] = request.form['delivery-phone']
    session['email'] = request.form['delivery-email']
    session['delivery_options'] = request.form['delivery-notes']
    return render_template("payment.html")
  else:
    error = "You did not fill in all important fields"
    return render_template("delivery-info.html",error=error)

@app.route('/orderPlaced', methods=['POST'])
def view_receipt():
  session['name'] = request.form['first-last-name']
  session['cc_num'] = request.form['cc-num']
  session['exp_date'] = request.form['exp-date']
  session['sec_code'] = request.form['sec-code']
  order_time = datetime.datetime.now()
  delivery_time = order_time+datetime.timedelta(minutes=30)
  deliverytime = delivery_time.strftime("%I:%M%p")
  breadbox.place_order(session['quantity'],session['name'],session['address'],session['phone'],session['email'],session['cc_num'],session['exp_date'],session['sec_code'])
  return render_template("orderPlaced.html", ordertime=deliverytime, name=session['name'], address=session['address'], email=session['email'], numLoaves=session['quantity'], bread=session['bread'])

@app.route('/')
def load_main():
  return redirect("index")

@app.route('/<name>')
def load_package(name):
  return render_template(name+".html")

if __name__ == '__main__':
  app.run(debug=True)
