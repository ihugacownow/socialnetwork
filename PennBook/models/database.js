var keyvaluestore = require('../models/keyvaluestore.js');

var userDB = new keyvaluestore('users'); 
userDB.init(function(err, data){}); 

var restaurantDB = new keyvaluestore('restaurants'); 
restaurantDB.init(function(err, data){}); 

var postDB = new keyvaluestore('posts');
postDB.init(function(err, data){}); 

var commentDB = new keyvaluestore('comments');
commentDB.init(function(err, data){}); 

var affiliationDB = new keyvaluestore('affiliations');
affiliationDB.init(function(err, data){}); 

var friendDB = new keyvaluestore('friends');
friendDB.init(function(err, data){}); 



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
				route_callbck(data[0], null);
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
var myDB_putUser = function(key, value, route_callbck){		
	userDB.put(key, value, function(err, data) {
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
}

//for getting all friends of a given user
var myDB_getFriends = function(userID, route_callbck) {
	friendDB.get(userID, function(err, data) {
		if (err) {
			route_callbck(err, null);
		} else {
			console.log("all friends: ", data);
			route_callbck(null, data);
		}
	})
}

//function for getting all posts
var myDB_getPosts = function(route_callbck) {
	postDB.scanKeyValues(function(err, data) {
		console.log("posts array that kvs gave us: ", data);
		if (err) {
			route_callbck(err, null);
		} else {
			route_callbck(null, data);
		}
	});
}

//function for getting a comment
var myDB_getComment = function(commentID, route_callbck) {
	commentDB.get(commentID, function(err, data) {
		if (err) {
			route_callbck(err, null);
		} else {
			route_callbck(null, data);
		}
	})
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

//adds a comment to our comment table:
// 1) add the comment
// 2) remove the post containg the comment from our posts table (it's timestamp is incorrect)
// 3) take the JSON object for that removed post, add the new comment's ID to it's commentIDs array
// 4) re-add this post back our post table (thereby updating it's timestamp)
var myDB_addComment = function(postInx, firstname, lastname, userID, postID, text, route_callbck) {
	//add the comment to our comments table
	var commentValue = {"postID": postID, "owner": userID, "text": text, "firstname": firstname, "lastname": lastname};
	commentDB.put2(JSON.stringify(commentValue), function(err, commentData) {
		//once comment has been added, remove the current post, update it, and re-add to post table
		postDB.remove(postID, postInx, function(err, postData) {
			var parsedData = JSON.parse(postData);
			var arr = JSON.parse(parsedData.commentIDs);
			arr.push(commentData);
			parsedData.commentIDs = JSON.stringify(arr);
			postDB.put(postID, JSON.stringify(parsedData), function(err, data) {
				if (err) {
					console.log("error re-adding post to table: " + err);
					route_callbck(err, null);
				} else {
					route_callbck(null, data);
				}
			})
		});
	})
}

//gets all the users in our users table
var myDB_getUsers = function(route_callbck) {
	userDB.scanKeyValues(function(err, data) {
		if (err) {
			console.log("could not scan key/values of users:" + err);
		} else {
			route_callbck(null, data);
		}
	})
}

//function for getting all the friends in our friends table
var myDB_allFriends = function(route_callbck) {
	friendDB.scanKeyValues(function(err, data) {
		if (err) {
			console.log("could not scan key/values of friends table: " + err);
		} else {
			route_callbck(null, data);
		}
	})
}

var myDB_updateNotifications = function(key, inx, attributes, route_callbck) {
	userDB.update(key, inx, attributes, function(err, data) {
		if (err) {
			console.log("could not update user's notifications part of table!" + err);
		} else {
			route_callbck(data, null);
		}
	})
}

//function for adding a post to our post database
var myDB_addPost = function(owner1, owner2, text, route_callbck) {
	//add the post to our post database, return the postID
	var value = JSON.stringify({"owner1": owner1, "owner2": owner2, "text": text, "commentIDs": []});
	postDB.put2(value, function(err, data) {
		if (err) {
			console.log("could not add post to database (KVS function failed): ", err);
		} else {
			route_callbck(null, data);
		}
	})
}

//adds a friendship for these two users
var myDB_addFriend = function(user1, user2, route_callbck) {
	friendDB.put(user1, user2, function(err, data) {
		if (err) {
			console.log("couldn't add friend to friend table!: ", err);
		} else {
			route_callbck(data);
		}
	})
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
		removeRestaurant: myDB_removeRestaurant,
		getFriends: myDB_getFriends,
		getPosts: myDB_getPosts,
		getComment: myDB_getComment,
		addComment: myDB_addComment,
		getUsers: myDB_getUsers,
		allFriends: myDB_allFriends,
		updateNotifications: myDB_updateNotifications,
		addPost: myDB_addPost,
		addFriend: myDB_addFriend
};

module.exports = database;





