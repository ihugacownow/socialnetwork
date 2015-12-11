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

var usersDBname = "users";
var postsDBname = "restaurants";
var commentsDBname = "comments";
var affiliationsDBname = "affiliations";
var friendsDBname = "friends";
var usernamesDBname = "usernames";

var users = [
	["hirshb@sas.upenn.edu", JSON.stringify({
		"firstname" : "Brian",
		"lastname" : "Hirsh",
		"password" : "password1",
		"status" : "Brians status",
		"affiliation" : "University of Pennsylvania",
		"interests" : ["computer science"],
		"birthday" : "April 20th 1996",
		"online" : "false",
		"posts" : JSON.stringify([0]),
		"comments" : JSON.stringify([0]),
		"friendposts" : JSON.stringify([0]), 
		"notifications" : JSON.stringify([])
	})
	], ["wuwc@sas.upenn.edu", JSON.stringify({
		"firstname" : "Wai",
		"lastname" : "Wu",
		"password" : "password2",
		"status" : "Wais status",
		"affiliation" : "University of Pennsylvania",
		"interests" : ["computer science"],
		"birthday" : "April 20th 1996",
		"online" : "false",
		"posts" : JSON.stringify([]),
		"comments" : JSON.stringify([1]),
		"friendposts" : JSON.stringify([0]),
		"notifications" : JSON.stringify([])
	})],
	["test", JSON.stringify({
		"firstname" : "test",
		"lastname" : "test",
		"password" : "test",
		"status" : "tests status",
		"affiliation" : "University of Pennsylvania",
		"interests" : ["computer science"],
		"birthday" : "April 20th 1996",
		"online" : false,
		"posts" : JSON.stringify([]),
		"comments" : JSON.stringify([]),
		"friendposts" : JSON.stringify([0])
	})]
];


var posts = [
	["0", JSON.stringify({
		"owner1" : 0, 
		"owner2" :1, 				
		"text" : "love u",
		"commentIDs" : JSON.stringify([0, 1])
	})]
];

// Key is post ID and secondary key will be the comments time stamp 
var comments = [
	["0", JSON.stringify({
		"postID" : 0,
		"owner" : 0,
		"text" : "love u too sexy",
		"firstname" : "Brian",
		"lastname" : "Hirsh",
	})], 
	["1", JSON.stringify({
		"postID" : 0,
		"owner" : 1,
		"text" : "love u too sexy",
		"firstname" : "Wai",
		"lastname" : "Wu"
	})
]
];

var affiliations = [
	["University of Pennsylvania", JSON.stringify([0, 1])]
];

var friends = [
		["0", "1"],
		["1", "0"],
		["0", "2"]
];

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
var k = {value: 0};
var l = {value: 0}; 
var m = {value: 0};
var n = {value: 0}; 

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
var usersDBname = "users";
var postsDBname = "posts";
var commentsDBname = "comments";
var affiliationsDBname = "affiliations";
var friendsDBname = "friends";


setup(null, [usersDBname, users, null], i);
setup(null, [postsDBname, posts, null], j);
setup(null, [commentsDBname, comments, null], k);
setup(null, [affiliationsDBname, affiliations, null], l);
setup(null, [friendsDBname, friends, null], m);





