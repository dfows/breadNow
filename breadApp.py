import os
from flask import * #Flask,render_template,session,redirect,url_for

app = Flask(__name__)
app.secret_key = 'asdf12345'

@app.route('/bread')
def select_bread():
  session['breading'] = True
  return render_template("quantity.html", flavorName = "sourdough") #should be most recent entry in DB table "BREAD OF WEEK"

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
  print session
  return render_template("orderPlaced.html")

@app.route('/')
def load_main():
  return redirect("index")

@app.route('/<name>')
def load_package(name):
  return render_template(name+".html")

if __name__ == '__main__':
  app.run(debug=True)
