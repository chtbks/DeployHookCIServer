const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const shell = require('shelljs');
const request = require('request');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.set('view engine', 'pug');

const PORT = process.env.PORT;
var devlink = 'https://development-infinite.chatbooks.com';
var staginglink = 'https://staging-infinite.chatbooks.com';
var prodlink = 'https://production-infinite.chatbooks.com';

function postToMabl(appEnv) {
	if (appEnv.includes('development')) {
		shell.exec('./dev-mabl.sh');
	} else if (appEnv.includes('staging')) {
		shell.exec('./staging-mabl.sh');
	} else if (appEnv.includes('production')) {
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
		devlink: devlink,
		staginglink: staginglink,
		prodlink: prodlink
	});
});
app.post('/', function(req, res) {
	if (req.body) {
		try {
			prodlink = 'https://' + req.body.app + '.herokuapp.com/';
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

app.listen(PORT);
