const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const shell = require('shelljs');
const request = require('request');
const mongo = require('./mongo.js');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.set('view engine', 'pug');
app.use(express.static(__dirname + '/public'));

const PORT = process.env.PORT;
var devlink = 'https://development-infinite.chatbooks.com';
var staginglink = 'https://staging-infinite.chatbooks.com';
var prodlink = 'https://production-infinite.chatbooks.com';

function postToMabl(appEnv) {
	if (appEnv.toLowerCase().includes('development')) {
		shell.exec('./dev-mabl.sh');
	} else if (appEnv.toLowerCase().includes('staging')) {
		shell.exec('./staging-mabl.sh');
	} else if (appEnv.toLowerCase().includes('production')) {
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
app.get('/liveHappyUsersCount', function(req, res) {
	mongo.liveHappyUsersCount(function(count) {
		res.send({ CurrentCount: count });
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
			res.send(
				postToSlack({
					status: 500,
					result: 'Failure',
					message:
						error + ' Could not execute POST requests to mabl and slack.',
					params: req.body.app
				})
			);
		}
	}
});

app.post('/getEmail', function(req, res) {
	mongo.getEmail(req.body, function(email) {
		res.send(email);
	});
});
app.post('/insertNewUserDocument', function(req, res) {
	mongo.insertNewUserDocument(req.body, function(result) {
		res.send(result);
	});
});
app.post('/updateDocument', function(req, res) {
	mongo.updateDocument(req.body.queryObject, req.body.updateObject, function(
		result
	) {
		res.send(result);
	});
});

app.listen(PORT);
