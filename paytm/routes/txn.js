var checksum = require('../util/checksum');
var config = require('../config');
var uniqid = require('uniqid');
var User = require('../../models/user');
var Purchase = require('../../models/purchase');
var utils = require('../../utils/utils');
var constants = require('../../config/constants');

module.exports = function (app) {

  app.get('/testtxn', function (req, res) {
    console.log("in restaurant");
    console.log("--------testtxnjs----");
    res.render('txn.ejs', { 'config': config });
  });

  app.post('/transaction', function (req, res) {
    console.log("POST Payment start");
    const base_price = req.body.base_price;
    const discount = req.body.discount;
    const tax = req.body.tax;
    const tot_price = req.body.tot_price;
    const user_id = req.body.user_id;
    const device_type = req.body.device_type;
    const order_type = req.body.order_type; // points or socials
    const order_qty = req.body.order_qty; // points or tickets count
    const item_name = req.body.item_name;
    var curr_date = utils.toLocalTime(new Date()); 

    var channel_id = '';
    if (device_type === 'web')
      channel_id = "WEB";
    else if (device_type === 'android' || device_type === 'ios')
      channel_id = "WAP";
    else
      return res.status(422).json({ error: 'device_type should be android, ios or web' });

    const order_id = uniqid(); //todo

    User.findById(user_id, function (err, user) {
      console.log(user);
      //record payment in db (Note async)
      var purchase_doc = {
        _user:user_id,
        orderType:order_type,
        orderId:order_id,
        orderQty:order_qty,
        itemName:item_name,
        date:curr_date,
        baseAmt: base_price,
        discount:discount,
        taxAmt:tax,
        totAmt:tot_price,
        deviceType:device_type,
        txnStatus:'success'
      };

      // initiate payment throught paytm
      var paramarray = new Array();
      paramarray['REQUEST_TYPE'] = "DEFAULT";
      paramarray['MID'] = config.MID;
      paramarray['ORDER_ID'] = order_id;
      paramarray['CUST_ID'] = user_id;
      paramarray['TXN_AMOUNT'] = tot_price;
      paramarray['CHANNEL_ID'] = channel_id;
      paramarray['INDUSTRY_TYPE_ID'] = config.INDUSTRY_TYPE_ID;
      paramarray['WEBSITE'] = config.WEBSITE;
      paramarray['MOBILE_NO'] = user.phone;
      paramarray['EMAIL'] = user.email;
      paramarray['CALLBACK_URL'] = constants.BASE_URL+'/response';
      //MERC_UNQ_REF
      paramarray['MERC_UNQ_REF'] = JSON.stringify(purchase_doc);
      
      var PAYTM_MERCHANT_KEY = config.PAYTM_MERCHANT_KEY;

      console.log('param array');
      console.log(paramarray);
      console.log('merchant key');
      console.log(PAYTM_MERCHANT_KEY);

      checksum.genchecksum(paramarray, PAYTM_MERCHANT_KEY, function (err, result) {
        console.log('result');
        console.log(result);
        res.render('pgredirect.ejs', { 'restdata': result });
      });
    });
    console.log("POST Payment end");
  });

};