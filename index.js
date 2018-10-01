const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const shell = require('shelljs');
const request = require('request');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.set('view engine', 'pug');

const PORT = process.env.PORT;
var link = 'https://www.google.com';

function postToMabl(appEnv) {
	if (appEnv === 'development-infinite') {
		shell.exec('./dev-mabl.sh');
	} else if (appEnv === 'staging-infinite') {
		shell.exec('./staging-mabl.sh');
	} else if (appEnv.includes('production-infinite')) {
		shell.exec('./');
	} else {
		throw 'Heroku web-app environment not configured.';
	}
}
function postToSlack(payload) {
	var bodyString = payload.app
		? payload.app.replace(/\"/g, '') +
		  ' deployed successfully and UI tests have been triggered.'
		: JSON.stringify(payload).replace(/\{|\}|\"/g, ' ');
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

app.get('/', function(req, res) {
	res.render('index', {
		chatbookslink: link
	});
});
app.post('/', function(req, res) {
	if (req.body) {
		try {
			link = 'https://' + req.body.app + 'herokuapp.com/';
			postToMabl(req.body.app);
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
