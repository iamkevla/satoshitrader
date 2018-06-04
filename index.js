var util = require('util'),
    _ = require('underscore'),
    request	= require('request'),
    crypto = require('crypto'),
    VError = require('verror'),
    now = require('nano-time');

var TradeSatoshi = function TradeSatoshi(key, secret, server, timeout)
{
    this.key = key;
    this.secret = secret;

    this.server = server || 'https://tradesatoshi.com/api';

    this.timeout = timeout || 30000;
};

TradeSatoshi.prototype.privateRequest = function(method, params, callback)
{
    var functionName = 'TradeSatoshi.privateRequest()',
        self = this;

    if(!this.key || !this.secret)
    {
        var error = new VError('%s must provide key and secret to make this API request.', functionName);
        return callback(error);
    }

    if(!_.isArray(params))
    {
        var error = new VError('%s second parameter %s must be an array. If no params then pass an empty array []', functionName, params);
        return callback(error);
    }

    if (!callback || typeof(callback) != 'function')
    {
        var error = new VError('%s third parameter needs to be a callback function', functionName);
        return callback(error);
    }

    const nounce = new Date().getTime();

    const text = `${this.apiKey}POST${encodeURIComponent(config.baseURL + '/private/getBalances').toLocaleLowerCase()}${nounce}${Buffer.from(JSON.stringify(config.data)).toString('base64')}`;

    var signer = crypto.createHmac('sha512', this.secret);
    var hmac = signer.update(text).digest('hex');
    var signature = new Buffer(this.key + ':' + hmac).toString('base64');

    var headers = {
        'Authorization': `Basic ${this.apiKey}:${signature}:${nounce}`,
        'Content-Type': 'application/json; charset=utf-8'
    };

    var options = {
        url: this.server + '/private/getBalances',
        method: 'POST',
        headers: headers
    };

    var requestDesc = util.format('%s request to url %s with tonce %s, method %s and params %s',
        options.method, options.url, tonce, method, JSON.stringify(params));

    executeRequest(options, requestDesc, callback);
};

function executeRequest(options, requestDesc, callback)
{
    var functionName = 'TradeSatoshi.executeRequest()';

    request(options, function(err, response, data)
    {
        var error = null;   // default to no errors

        if(err)
        {
            error = new VError(err, '%s failed %s', functionName, requestDesc);
            error.name = err.code;
        }
        else if (response.statusCode < 200 || response.statusCode >= 300)
        {
            error = new VError('%s HTTP status code %s returned from %s', functionName,
                response.statusCode, requestDesc);
            error.name = response.statusCode;
        }
        // if request was not able to parse json response into an object
        else if (!_.isObject(data) )
        {
            error = new VError('%s could not parse response from %s\nResponse: %s', functionName, requestDesc, data);
            error.name = data;
        }
        else if (_.has(data, 'error'))
        {
            error = new VError('%s API returned error code %s from %s\nError message: %s', functionName,
                data.error.code, requestDesc, data.error.message);
            error.name = data.error.message;
        }

        callback(error, data);
    });
}

//
// Private Functions
//

TradeSatoshi.prototype.getBalances = function getBalances(callback )
{

    this.privateRequest('getBalances', callback);
};

module.exports = TradeSatoshi;
