var checksum = require('../util/checksum');
var config = require('../config');
var Purchase = require('../../models/purchase');
var User = require('../../models/user');
var utils = require('../../utils/utils');
module.exports = function (app) {
  app.post('/response', async function (req, res) {
    console.log("in response post");
    var paytm_response = req.body;
    console.log(paytm_response);
    if (checksum.verifychecksum(paytm_response, config.PAYTM_MERCHANT_KEY)) {
      console.log("true");
      if (paytm_response.STATUS == 'TXN_SUCCESS') {
        var order_id = paytm_response.ORDERID;
        var txn_id = paytm_response.TXNID;
        var purchase_doc = JSON.parse(paytm_response.MERC_UNQ_REF);

        // record the purchase
        var purchase = await Purchase.create(purchase_doc);
        // update user points
        if (purchase.orderType == 'points') {
          var expiry_date = new Date();
          expiry_date.setDate(expiry_date.getDate() + 30);
          expiry_date = utils.toLocalTime(expiry_date);
          var user = await User.findByIdAndUpdate(purchase._user, {
            $inc: { points: purchase.orderQty },
            expiry_date: expiry_date
          });
          res.render('success.ejs');
        }
      }
      else if (paytm_response.STATUS == 'TXN_FAILURE') {
        // delete order
        res.render('error.ejs', { message: 'Transaction failed. Please Retry' });
      }
      else {
        // record payment as pending
        var purchase_doc = JSON.parse(paytm_response.MERC_UNQ_REF);
        purchase_doc.txnStatus = 'pending';
        var purchase = await Purchase.create(purchase_doc);
        res.render('error.js', { message: 'Transaction pending. Please check after some time' });
      }
    }
    else {
      console.log("false");
      res.render('error.ejs', { message: 'Transaction Unsuccessful. Try again' });
    };
  });
};