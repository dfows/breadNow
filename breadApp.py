import os #, datetime
from flask import * #Flask,render_template,session,redirect,url_for
from pymongo import MongoClient
import breads

app = Flask(__name__)
app.secret_key = 'asdf12345'

client = MongoClient(os.getenv('MONGOHQ_URL'))
database = client.dailyBread
breadbox = breads.Breads(database)

@app.route('/bread')
def select_bread():
  session['breading'] = True
  bread_of_week = breadbox.get_bow()
  print bread_of_week
  return render_template("quantity.html", flavorName = bread_of_week) #should be most recent entry in DB table "BREAD OF WEEK"

@app.route('/quantity')
def select_quant(q):
  session['quantity'] = q
  return render_template("delivery-info.html")

@app.route('/delivery-info', methods=['POST'])
def enter_info():
  error = None
  if request.method == 'POST': 
    session['address'] = request.form['delivery-address']
    session['phone'] = request.form['delivery-phone']
    session['email'] = request.form['delivery-email']
    session['delivery_options'] = request.form['delivery-notes']
    return render_template("payment.html")
  else:
    error = "You did not fill in all important fields"
    return render_template("deliver-info.html",error=error)

@app.route('/payment', methods=['POST'])
def place_order():
  session['name'] = request.form['first-last-name']
  session['cc_num'] = request.form['cc-num']
  session['exp_date'] = request.form['exp-date']
  session['sec_code'] = request.form['sec-code']
  breadbox.place_order(session['quantity'],session['name'],session['address'],session['phone'],session['email'],session['cc_num'],session['exp_date'],session['sec_code'])
  return render_template("orderPlaced.html", name=session['name'], address=session['address'], email=session['email'], numLoaves=session['quantity'])

@app.route('/')
def load_main():
  return redirect("index")

@app.route('/<name>')
def load_package(name):
  return render_template(name+".html")

if __name__ == '__main__':
  app.run(debug=True)
