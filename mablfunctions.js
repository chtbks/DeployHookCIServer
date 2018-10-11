var XMLHttpRequest = require('xmlhttprequest').XMLHttpRequest;
function mablJavaScriptStep(mablInputs, callback) {
	// enter code here, return result in callback
	var xhr = new XMLHttpRequest();
	xhr.open(
		'POST',
		'https://deployhookciserver.herokuapp.com/insertNewUserDocument',
		true
	);
	xhr.setRequestHeader('Content-Type', 'application/json');
	xhr.onload = function() {
		callback(xhr.responseText);
	};
	xhr.send(
		JSON.stringify({
			emailAddress: mablInputs.variables.user.NewEmail,
			environmentCreatedOn: 'dev-app',
			hasShippingInfoSaved: false,
			hasCCInfoSaved: false,
			customBookDraftQuantity: 0,
			customBookOrderedQuantity: 0,
			cardDraftQuantity: 0,
			cardOrderedQuantity: 0,
			seriesDraftQuantity: 0,
			seriesSubscribedQuantity: 0,
			seriesSourcesInDrafts: [],
			customSourcesInDrafts: []
		})
	);
}

mablJavaScriptStep(
	{
		variables: {
			user: {
				NewEmail: 'test2@jamily.co'
			}
		}
	},
	function(value) {
		console.log(value);
	}
);
