var TradeSatoshi = require('tradesatoshi');


//
// Or enter them below.
// WARNING never commit your API keys into a public repository.
var key = process.argv[2] || 'your-api-key';
var secret = process.argv[3] || 'your-api-secret';

var privateClient = new TradeSatoshi(key, secret);

// uncomment the API you want to test.

// privateClient.getBalances(console.log);
