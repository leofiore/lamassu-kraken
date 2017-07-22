'use strict';

// Tradable assets from https://api.kraken.com/0/public/AssetPairs
var assetNames = {
    'EUR': 'XXBTZEUR',
    'USD': 'XXBTZUSD'
};

var KrakenClient = require('kraken-api');

var KrakenTicker = function () {
    this.client = new KrakenClient();
};

//KrakenTicker.prototype.ticker = function ticker(currencies, callback) {
function ticker(currencies, callback) {
    this.client = new KrakenClient();
    if (currencies.length === 0) {
	return callback(new Error('No currency specified.'));
    };

    var queryArray = [];
    if (typeof currencies === 'string') {
        currencies = [currencies]; // why it alwasy ends like this with javascript lamers and dynamic typing? I Cry.
    }
    for (var i = 0; i < currencies.length; i++) {
	var currency = currencies[i];
	if (currency in assetNames) {
	    queryArray.push(assetNames[currency]);
	} else {
	    return callback(new Error('Unsupported currencies.'));
	}
    }
    var query= { 'pair': queryArray.join(",") };

    this.client.api('Ticker', query, function(error, response) {
	if (error) {
	    return callback(error);
	} else {
	    if ('result' in response) {
		var result = response['result'];
		var tickerResponse = {}
		for (var i = 0; i < currencies.length; i++) {
		    var currency = currencies[i];
		    var assetName = assetNames[currency];
		    if (assetName in result) {
			// add the "ask" price of the given currency to the ticker data
			tickerResponse[currency] = {'currency': currency, 'rates': { 'ask': result[assetName].a[0], 'bid': result[assetName].b[0]}}
		    } else {
			return callback(new Error('Wrong response data.'));
		    }
		}
		return callback(null, tickerResponse);
	    } else {  // result object not in response
		return callback(new Error('Can\'t find required parts in response data.'));
	    }
	}
    });
};


//KrakenTicker.factory = function factory() {
//    return new KrakenTicker();
//};

//module.exports = KrakenTicker;
module.exports = ticker;
