const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const shell = require('shelljs');
const request = require('request');
//const router = express.Router();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const PORT = process.env.PORT;

function postToMabl() {
	shell.exec('./mabl.sh');
}
function postToSlack(payload) {
	var bodyString = JSON.stringify(payload).replace(/\{|\}|\"/g, ' ');
	var requestShiz = {
		uri:
			'https://hooks.slack.com/services/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',
		body: '{"text": "' + bodyString + '"}',
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		}
	};
	request(requestShiz, function(error, response) {
		console.log(error, response.body);
		return;
	});
	return bodyString;
}
//app.use('/api', router);

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
	if (req.body) {
		try {
			//postToMabl();
			postToSlack(req.body);
			res.send({
				status: 200,
				result: 'Success'
			});
		} catch (error) {
			postToSlack('{"message": "' + error + '"}');
			res.send({
				status: 500,
				result: 'Failure',
				message: error + '. Could not execute POST requests to mabl and slack.'
			});
		}
	}
});

app.listen(3000);
