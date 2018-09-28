const express = require('express');
const bodyParser = require('body-parser');
const app = express();
//const router = express.Router();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const PORT = process.env.PORT;

/*var request = require('request');
function updateClient(postData) {
	var clientServerOptions = {
		uri:
			'https://hooks.slack.com/services/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',
		body: JSON.stringify(postData),
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		}
	};
	request(clientServerOptions, function(error, response) {
		return response.body;
	});
}
app.use('/api', router);*/

//const originWhitelist = ['https://deployhookciserver.herokuapp.com'];

// middleware route that all requests pass through
/*router.use((request, response, next) => {
	let origin = request.headers.origin;

	// only allow requests from origins that we trust
	if (originWhitelist.indexOf(origin) > -1) {
		response.setHeader('Access-Control-Allow-Origin', origin);
	}

	// only allow get requests, separate methods by comma e.g. 'GET, POST'
	response.setHeader('Access-Control-Allow-Methods', 'POST');
	response.setHeader('Access-Control-Allow-Credentials', true);

	// push through to the proper route
	next();
});*/

app.get('/', function(req, res) {
	res.send('Send cookies to Bert plz');
});
app.post('/', function(req, res) {
	res.send(req.body);
});

app.listen(3000);
