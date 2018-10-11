const express = require('express');
const bodyParser = require('body-parser');
const app = express();
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
var username = 'key';
var password = 'IH_DT73H_0-0hFxTIpiJbQ';

function waitForPlanToFinishThenPostToSlack(url, callback) {
	setTimeout(function() {
		request.get({ url: url }, function(error, response, body) {
			if (error) throw error;
			try {
				var responseBody = JSON.parse(body);
				console.log(
					'Waiting for plan to finish. Start time is:  ' +
						responseBody.executions[0].start_time
				);
				if (responseBody.executions[0].stop_time) {
					console.log(
						'Plan finished. Stop time was: ' +
							responseBody.executions[0].stop_time
					);
					callback(responseBody);
				} else {
					throw 'No stop time found';
				}
			} catch (err) {
				if (err !== 'No stop time found') {
					throw err;
				}
				console.log(err);
				waitForPlanToFinishThenPostToSlack(url, callback);
			}
		});
	}, 5000);
}
function getSlackBody(response, callback) {
	var summaryArray = [];
	response.executions[0].journey_executions.forEach(function(execution) {
		var failureSummary;
		try {
			failureSummary = execution.failure_summary.error;
			console.log(failureSummary);
		} catch (err) {
			console.log('No failure summary found');
			failureSummary = 'None';
		}
		summaryArray.push({
			fallback: 'View the details of the tests at ' + execution.app_href,
			text:
				'*Test Name:* ' +
				response.executions[0].journeys.find(o => o.id === execution.journey_id)
					.name +
				'\n*Test Passed:* ' +
				execution.success +
				'\n*Error Details:* ' +
				'_' +
				failureSummary +
				'_',
			actions: [
				{
					type: 'button',
					text: 'View more details',
					url: execution.app_href
				}
			]
		});
	});

	var stopTime = new Date(response.executions[0].stop_time);
	var startTime = new Date(response.executions[0].stop_time);
	var diffMs = stopTime.getTime() - startTime.getTime();
	var diffTime = Math.round(diffMs / 60000);
	console.log('Plan took ' + diffTime);
	var slackBody = {
		text:
			'All "' +
			response.executions[0].plan.name +
			'"' +
			' integration test results are as follows:' +
			'\nTotal run time for test plan was: ' +
			diffTime +
			' minutes' +
			'\n' +
			response.journey_execution_metrics.passed +
			' out of ' +
			response.journey_execution_metrics.total +
			' tests passed.' +
			'\n\n_Individual test run details:_\n\n\n',
		attachments: summaryArray
	};
	console.log(slackBody.text);
	callback(slackBody);
}

function mablPlanTrigger(body) {
	var requestShiz = {
		uri:
			'https://' +
			username +
			':' +
			password +
			'@api.mabl.com/events/deployment',
		body: body,
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		}
	};
	request(requestShiz, function(error, response, body) {
		if (error) throw error;
		var responseBody = JSON.parse(body);
		var url =
			'https://' +
			username +
			':' +
			password +
			'@api.mabl.com/execution/result/event/' +
			responseBody.id;
		waitForPlanToFinishThenPostToSlack(url, function(response) {
			getSlackBody(response, function(slackBody) {
				postToSlack(slackBody);
			});
		});
	});
}

function postToMabl(appEnv) {
	if (appEnv.toLowerCase() === 'development') {
		mablPlanTrigger(
			'{"environment_id":"Ip12fB8nYAGkE-_BNrRywA-e","application_id":"3whgiioJBuy1sT28na81kg-a"}'
		);
	} else if (appEnv.toLowerCase() === 'staging') {
		mablPlanTrigger(
			'{"environment_id":"ddJ4G6h8_8vM2LrsfsNo4A-e","application_id":"_htYcsqw6Rh0fcrtB3GbcA-a"}'
		);
	} else if (appEnv.toLowerCase() === 'production') {
	} else {
		throw 'Heroku web-app environment not configured.';
	}
}
function postToSlack(payload) {
	var requestShiz = {
		uri:
			'https://hooks.slack.com/services/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',
		body: JSON.stringify(payload),
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		}
	};
	request(requestShiz, function(error, response) {
		console.log(error, response.body);
		return;
	});
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
app.get('/liveHappyUsersCount/ByMonth', function(req, res) {
	mongo.liveHappyUsersCountByMonth(function(dateObject) {
		res.send(dateObject);
	});
});

app.post('/', function(req, res) {
	if (req.body) {
		try {
			prodlink = 'https://' + req.body.app + '.herokuapp.com/';
			postToMabl(req.body.app);
			res.send({
				status: 200,
				result: 'Test run started.'
			});
		} catch (error) {
			res.send(
				postToSlack({
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
	postToSlack({
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
