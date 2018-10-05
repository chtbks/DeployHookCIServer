var MongoClient = require('mongodb').MongoClient;
var url =
	'mongodb://chatomation:nothanks@ds125255.mlab.com:25255/heroku_9zhjv4th';
var dbName = 'heroku_9zhjv4th';
var collectionName = 'chatomation-users';
var liveHappyCollectionName = 'live-happy-users';
var self = this;

self.insertNewUserDocument = function(userObject, callback) {
	MongoClient.connect(
		url,
		{ useNewUrlParser: true },
		function(err, db) {
			if (err) throw err;
			var dbo = db.db(dbName);
			var collection = dbo.collection(collectionName);
			collection.insert(userObject, function(err, result) {
				if (err) throw err;
				callback(result);
				db.close();
			});
		}
	);
};
self.getEmail = function(queryObject, callback) {
	MongoClient.connect(
		url,
		{ useNewUrlParser: true },
		function(err, db) {
			if (err) throw err;
			var dbo = db.db(dbName);
			dbo
				.collection(collectionName)
				.find(queryObject)
				.toArray(function(error, docs) {
					if (error) throw error;
					//random doc
					var doc = docs[Math.floor(Math.random() * docs.length)];
					callback(doc);
					db.close();
				});
		}
	);
};
self.updateDocument = function(queryObject, updateObject, callback) {
	MongoClient.connect(
		url,
		{ useNewUrlParser: true },
		function(err, db) {
			if (err) throw err;
			var dbo = db.db(dbName);
			var collection = dbo.collection(collectionName);
			collection.updateOne({ queryObject }, { $set: updateObject }, function(
				err,
				result
			) {
				if (err) throw err;
				callback(result);
				db.close();
			});
		}
	);
};
self.liveHappyUsersCount = function(callback) {
	MongoClient.connect(
		url,
		{ useNewUrlParser: true },
		function(err, db) {
			if (err) throw err;
			var dbo = db.db(dbName);
			dbo
				.collection(liveHappyCollectionName)
				.count({}, function(error, numOfDocs) {
					if (error) throw error;
					callback(numOfDocs);
					db.close();
				});
		}
	);
};
