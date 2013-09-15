import string

class Breads(object):
  def __init__(self,database):
    self.db = database
    self.orders = database.orders
    self.BoW = database.BoW

  def get_bow(self):
    latest = self.BoW.find().sort("_id",-1).limit(1)[1]
    return latest['flavor']+" "+latest['type']

  def place_order(self,quantity,name,address,phone,email,ccNum,expDate,secCode):
    creditCard = {'number':ccNum,'expDate':expDate,'secCode':secCode}
    order = {'numLoaves':quantity,'name':name, 'address':address, 'phone':phone, 'email':email, 'payment':creditCard}
    self.orders.insert(order)
    
