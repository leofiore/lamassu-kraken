'use strict';

var request = require('request');

// Tradable assets from https://api.kraken.com/0/public/AssetPairs
var assetNames = {
    'EUR': 'XXBTZEUR',
    'USD': 'XXBTZUSD'
};
var KrakenAPIURL = 'https://api.kraken.com/0/public/Ticker';

var KrakenTicker = function () {

};

KrakenTicker.factory = function factory() {
    return new KrakenTicker();
};

KrakenTicker.prototype.ticker = function ticker(currencies, callback) {
    if (currencies.length === 0) {
	return callback(new Error('No currency specified.'));
    };

    var queryArray = [];
    for (var i = 0; i < currencies.length; i++) {
	var currency = currencies[i];
	if (currency in assetNames) {
	    queryArray.push(assetNames[currency]);
	} else {
	    return callback(new Error('Unsupported currencies.'));
	}
    }

    var queryOptions = {
	url: KrakenAPIURL,
	headers: {
            'User-Agent': 'lamassu-kraken'
	},
	qs: {
	    'pair': queryArray.join(",")
	}
    };

    request(queryOptions, function(error, response, body) {
	if (error) {
	    return callback(error);
	}
	try {
	    var responseJSON = response.toJSON();
	} catch(e) {
	    return callback(new Error('Can\'t parse response data.'));
	}
	if (result in responseJSON) {
	    var result = responseJSON.result;
	    var tickerResponse = {}
	    for (var i = 0; i < currencies.length; i++) {
		var currency = currencies[i];
		var assetName = assetNames[currency];
		if (assetName in result) {
		    // add the "ask" price of the given currency to the ticker data
		    tickerResponse[currency] = {'currency': currency, 'rate': result[assetName].a[0]}
		} else {
		    return callback(new Error('Wrong response data.'));
		}
	    }
	    return callback(null, tickerResponse);
	} else {  // result object not in response
	    return callback(new Error('Can\'t find required parts in response data.'));
	}
    });
};

module.exports = KrakenTicker;
