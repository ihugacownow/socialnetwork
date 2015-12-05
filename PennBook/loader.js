/* This is a simple example of a program that creates the database and puts some 
   initial data into it. You don't strictly need this (you can always edit the
   database using the DynamoDB console), but it may be convenient, e.g., when you
   need to reset your application to its initial state during testing. */

var AWS = require('aws-sdk');
AWS.config.loadFromPath('./config.json');

var db = new AWS.DynamoDB();
var kvs = require('./models/keyvaluestore.js');

var async = require('async');

/* Here is our initial data. */

var userDBname = "users";
var restaurantDBname = "restaurants";

var users = [["mickey", JSON.stringify({
	"password" : "mouse", 
	"fullname" : "Mickey Mouse"})
	]];

var restaurants = [["White Dog", JSON.stringify( 
		{"latitude" : 39.953637, 
			"longitude" : -75.192883, 
			"description" : "Very delicious", 
			"creator" : "mickey"
		}
		)]];

//  This function uploads our data in a generic way 
var uploadThings = function(things, table, callback) {
	async.forEach(things, function (thing, callback) {
		table.put(thing[0], thing[1], function(err, data) {
			if (err)
				console.log("Oops, error when adding "+thing[0]+": " + err);
		});
	}, callback);
}


/* This function does the actual work. Since it needs to perform blocking
   operations at various points (create table, delete table, etc.), it 
   somewhat messily uses itself as a callback, along with a counter to
   distinguish which part of the function is called. In other words, 'i'
   starts out being 0, so the first thing the function does is delete the
   table; then, when that call returns, 'i' is incremented, and the 
   function creates the table; etc. */

var i = {value: 0};
var j = {value: 0}; 

//data[0] is the name of the table, data[1] is the array of information 
function setup(err, data, counter) {
	console.log("counter is: " + counter.value); 
	counter.value++;
	console.log("counter incremented is: " + counter.value); 
	if (err && counter.value != 2) {
		console.log("Error: " + err); 
	} else if (counter.value ==1) {
		console.log("Deleting table "+data[0]+" if it already exists...");
		params = {
				"TableName": data[0]
		}
		db.deleteTable(params, function(){
			console.log("Waiting 10s for the table  "+data[0]+" to be deleted...")
			setTimeout(function() {
				setup(err, data, counter);
			},10000) 
		})
	} else if (counter.value==2) {
		console.log("Creating table "+data[0]+"...");
		data[2] = new kvs(data[0])
		data[2].init(function() {
			setup(err, data, counter);
		})
	} else if (counter.value==3) {
		console.log("Waiting 10s for the table  "+data[0]+" to become active...")
		setTimeout(function() {
			setup(err, data, counter);
		},10000)
	} else if (counter.value==4) {
		console.log("Uploading")
		uploadThings(data[1], data[2], function(){
			console.log("Done uploading  "+data[0]+" table!")
		});
	}
}

setup(null, [userDBname, users, null], i);
setup(null, [restaurantDBname, restaurants, null], j);
