const express = require('express');
const bodyParser = require('body-parser');
const mabl = require('./mabl.js');
const app = express();
const mongo = require('./mongo.js');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.set('view engine', 'pug');
app.use(express.static(__dirname + '/public'));

const PORT = process.env.PORT;
var devlink = 'https://development-infinite.chatbooks.com';
var staginglink = 'https://staging-infinite.chatbooks.com';
var prodlink = 'https://production-infinite.chatbooks.com';

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
app.get('/liveHappyUsersCount/ByMonth', function(req, res) {
	mongo.liveHappyUsersCountByMonth(function(dateObject) {
		res.send(dateObject);
	});
});

app.post('/', function(req, res) {
	if (req.body) {
		try {
			prodlink = 'https://' + req.body.app + '.herokuapp.com/';
			mabl.postToMabl(req.body.app);
			res.send({
				status: 200,
				result: 'Test run started.'
			});
		} catch (error) {
			res.send(
				mabl.postToSlack({
					text: 'Failure to execute tests',
					attachments: [
						{
							text:
								error + ' Could not execute POST requests to mabl and slack.'
						}
					]
				})
			);
		}
	}
});

app.post('/testSlack', function(req, res) {
	mabl.postToSlack({
		text: 'Failure to execute tests',
		attachments: [
			{
				text:
					req.body.app + ' Could not execute POST requests to mabl and slack.'
			}
		]
	});
	res.send({ success: 'true' });
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

app.listen(3000);
