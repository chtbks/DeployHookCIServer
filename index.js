const express = require('express');
const bodyParser = require('body-parser');
const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const PORT = process.env.PORT;

var request = require('request');
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
		return;
	});
}

app.post('/', function(req, res) {
	if (req) {
		res.send(updateClient(req.body));
	}
});

app.listen(PORT);
