'use strict';

var DEBUG = true;  // when true, orders are just validated by Kraken, not fulfilled
var SATOSHI_FACTOR = Math.pow(10,8);

// Translating currency code for Kraken
var currencies = {'USD' : 'ZUSD',
		  'EUR' : 'ZEUR',
		  'BTC' : 'XXBT'
		 };

var KrakenClient = require('kraken-api');

var KrakenTrade = function(config) {
    this.client = new KrakenClient(config.key, config.secret);
    if (config.currency != 'EUR' || config.currency != 'USD') {
	// need to raise error, can trade only EUR
    }
    this._currency = config.currency;
};

KrakenTrade.factory = function factory(config) {
    return new KrakenTrade(config);
};

// Public functions

KrakenTrade.prototype.balance = function balance(callback) {
    var kcurrency = currencies[this._currency];
    this.client.api('Balance', null, function(error, response) {
	if (error) {
	    return callback(error);
	}
	else {
	    var balances = response.result;
	    var eur_balance = 0.0;
	    if (balances[kcurrency]) {
		try {
		    eur_balance = parseFloat(balances[kcurrency], 10)
		} catch(e) {
		    return callback("Can't parse balance information!");
		}
	    }
	    return callback(null, eur_balance);
	}
    });
};

KrakenTrade.prototype.currency = function currency() {
    return this._currency;
};

KrakenTrade.prototype.purchase = function purchase(satoshis, currentPrice, callback) {
    var bitcoins = satoshis / SATOSHI_FACTOR;
    var amountStr = bitcoins.toFixed(8);

    // Buy at market price, when validate is true only check but do not fulfill
    var orderInfo = { 'pair' : 'XXBT'+currencies[this._currency],
		      'type' : 'buy',
		      'ordertype' : 'market',
		      'volume': bitcoins,
		      'validate' : DEBUG
		    };
    this.client.api('AddOrder', orderInfo, function(error, response) {
	if (error) {
	    return callback(error);
	}
	else {
	    if (DEBUG) {
		console.log(response.result);
	    }
	    return callback();
	}
    });
};

module.exports = KrakenTrade;
