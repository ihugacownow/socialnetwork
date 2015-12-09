var keyvaluestore = require('../models/keyvaluestore.js');
var kvs = new keyvaluestore('words');
kvs.init(function(err, data){});

var userDB = new keyvaluestore('users'); 
userDB.init(function(err, data){}); 

var restaurantDB = new keyvaluestore('restaurants'); 
restaurantDB.init(function(err, data){}); 

/* The function below is an example of a database method. Whenever you need to 
   access your database, you should define a function (myDB_addUser, myDB_getPassword, ...)
   and call that function from your routes - don't just call DynamoDB directly!
   This makes it much easier to make changes to your database schema. */

var myDB_lookup = function(searchTerm, language, route_callbck){
	console.log('Looking up: ' + searchTerm);	
	kvs.get(searchTerm, function (err, data) {
		if (err) {
			route_callbck(null, "Lookup error: "+err);
		} else if (data == null) {
			route_callbck(null, null);
		} else {
			route_callbck({ translation : data[0].value }, null);
		}
	});
};

//For password and user name check 
var myDB_getUser = function(username, password, route_callbck){
	userDB.get(username, function (err, data) {
		if (err) { 
			route_callbck(null, "Lookup error: "+err);
		} else if (data == null) {
			// If cannot find user in db, means user name does not exist 
			route_callbck(null, "User name is invalid");
		} else {
			// Access json from array of json 
			var json = JSON.parse(data[0].value); 
			if (json.password == password) {
				route_callbck("login succesful", null);
			} else {
				// password is not the same as input password
				route_callbck(null, "password is invalid");
			}
		}
	});
}

//For retrieving all restaurant data from table of restaurants 
var myDB_getRest = function(route_callbck){
	restaurantDB.scanKeyValues(function (err, data) {
		if (err) {
			route_callbck(null, "Lookup error: "+err);
		} else if (data == null) {
			route_callbck(null, "No data in database"); 
		} else {
			route_callbck(data , null);
		}
	});
}

//For creating a user and adding to the table of users 
var myDB_putUser = function(value, route_callbck){		
	userDB.putUser(value, function(err, data) {
		if (err) {
			route_callbck(null, err);
		} else {
			var keyval = JSON.stringify({
				"userID" : data,
				"firstname" : value.firstname,
				"lastname" : value.lastname,
				"email" : value.email,
				"password" : value.password,
				"status" : value.status,
				"affiliation" : value.affiliations,
				"interests" : value.interests,
				"birthday" : value.birthday,
				"online" : value.online,
				"posts" : value.posts,
				"comments" : value.comments,
				"friendposts" : value.friendposts
			})
			route_callbck(data, null);
		}
	})

	// userDB.exists(username, function(err, data) {
	// 	if (!data) {
	// 		// No identical username entry exists, so can add user 
	// 		userDB.put(username, value, function (err, dataTwo) {
	// 			if (err) {
	// 				route_callbck(null, err);
	// 			} else if (dataTwo == null) {
	// 				route_callbck(null, null);
	// 			} else {					
	// 				route_callbck("User added in succesfully", null);						
	// 			}
	// 		});
	// 	} else {
	// 		// exist data is true means that user exists, so pass back null data
	// 		// to indicate user was not added in successfully 
	// 		route_callbck(null, null); 
	// 	}
	// });		
}

//For adding restaurant data to the table of restaurants 
var myDB_putRestaurant = function(name, value, route_callbck){	
	restaurantDB.put(name, value, function (err, data) {
		if (err) {
			route_callbck(null, err);
		} else if (data == null) {
			route_callbck(null, null);
		} else {					
			route_callbck("User added in succesfully", data);						
		}
	});
}		

var myDB_removeRestaurant = function(keyword, inx, route_callbck) {
	restaurantDB.remove(keyword, inx, function(err, data) { 				
		if (err) {
			route_callbck(null, err);
		} else if (data == null) {
			route_callbck(null, null);
		} else {					
			route_callbck(null, "User removed succesfully");
		}
	});
}

/* We define an object with one field for each method. For instance, below we have
   a 'lookup' field, which is set to the myDB_lookup function. In routes.js, we can
   then invoke db.lookup(...), and that call will be routed to myDB_lookup(...). */

var database = { 
		lookup: myDB_lookup,
		lookupUser: myDB_getUser,
		getAllRestaurants: myDB_getRest, 
		putUser: myDB_putUser,
		putRestaurant: myDB_putRestaurant,
		removeRestaurant: myDB_removeRestaurant
};

module.exports = database;

