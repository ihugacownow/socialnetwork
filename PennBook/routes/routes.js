var db = require('../models/database.js');
var async = require('async');
var $ = require('jQuery');

var getMain = function(req, res) {
	res.render('main.ejs', { 
		message: "", 
		footer: "Full Name: Wai Wu, SEAS Login: wuwc"
	});
};

var getTestMain = function(req, res) {
	res.render('profile.ejs', { 
		message: "", 
		footer: "Full Name: Wai Wu, SEAS Login: wuwc"
	});
};

var postLogin = function(req, res) {
	var userInput = req.body.userField;
	var passwordInput = req.body.passwordField;

	// Check if username or password is missing 
	if (userInput == "" || passwordInput == "") {
		res.render('main.ejs',  {
			message: "Fill up the Empty Fields!" , 
			footer: "Full Name: Wai Wu, SEAS Login: wuwc"
		});
	} else {
		// Now check to see if user and password combination is inside the database  
		db.lookupUser(userInput, passwordInput, function(data, err) {
			if (err) {
				// User or Password not valid, so redirect to login page with error message 
				res.render('main.ejs', {
					userInput: userInput, 
					message: err, 
					footer: "Full Name: Wai Wu, SEAS Login: wuwc"
				});
			} else if (data) {			
				// Save username in session object and redirect to restaurant page
				var json = JSON.parse(data.value);
				console.log("req session values!!", json);
				req.session.ID = data.inx;
				req.session.firstname = json.firstname;
				req.session.lastname = json.lastname;
				req.session.email = json.email; 
				res.redirect('/restaurants');			
			} else {
				// Should not hit this case 
				res.render('main.ejs', {
					firstname: test,
					lastname: test,
					userID: test,
					userInput: userInput, 
					message: 'Null Data', 
					footer: "Full Name: Wai Wu, SEAS Login: wuwc"
				});
			}
		});
	}
};

var postTestRestaurants = function(req, res) {
	//If the user is not logged in, redirect him to login
	
	posts = [JSON.stringify(
					{'key' : "0", 
				 	'inx' : "0",
				  	'value' : {"owner1" 	: "Brian", 
				  				 'owner2'	: "Wai", 
				  				 'text'		: "yoooooo my post is this", 
				  				 'commentTexts' : ["comment 1", "comment 2"],				  				 
				  				 'commentOwners' : ["Brian", "Wai Commenter"]
				  				}				  				
				  			
				  	}), 

			JSON.stringify(
					{'key' : "0", 
				 	'inx' : "0",
				  	'value' : {"owner1" 	: "Brian", 
				  				 'owner2'	: "Wai", 
				  				 'text'		: "yoooooo my post is this", 
				  				 'commentTexts' : ["comment 1", "comment 2"],
				  				 'commentOwners' : ["Brian", "Wai Commenter"]
				  				}				  				
				  			
				  	}), 

			];

		

			res.render('restaurants.ejs', {
				session: req.session, 
				message: null, 
				posts: posts
			});		
};

var test = function(req, res) {

	db.getComment("0", function(err, commentData) {

	});
	console.log("Finished");
}


var postRestaurants = function(req, res) {
	//If the user is not logged in, redirect him to login
	if (req.session.ID == "") {
		res.render('main.ejs', {
			message: "", 
			footer: "Full Name: Wai Wu, SEAS Login: wuwc"
		});
	}
	db.getFriends("0", function(err, friends) {
		var friendsArr = [];
		for (var i = 0; i < friends.length; i++) {
			friendsArr.push(friends[i].value);
		}
		if (err) {
			console.log("error:", err);
		}
		db.getPosts(function(err, posts) {
			var postsString = []
			doPosts(postsString, posts, function(err, postsData) {
				var filteredPosts = []
				for (var i = 0; i < postsData.length; i++) {
					console.log("friends", friends);
					if (contains(postsData[i].value.owner1, friends) != -1 ||
						contains(postsData[i].value.owner2, friends) != -1) {
						filteredPosts.push(postsData[i]);
						console.log("success!");
					}
					console.log("filtered posts: ", filteredPosts);

				}
				res.render('restaurants.ejs', {session : req.session, message : "", posts : postsData});
			});	
		});
	});
}

//helper function for checking if an array contains an element
var contains = function(value, arr) {
	var contains = false;
	for (var i = 0; i < arr.length; i++) {
		if (arr[i] == value) {
			contains = true;
		}
	}
	return contains;
}

var doComments = function (post, commentIDs, callback) {
	async.forEachOf(commentIDs, function(commentID, key, inner_callback){
		// this is the function that executes on every item in the list
		// we need to make sure inner_callback gets run exactly once per loop
		// so that async knows when the item has been processed
		// this is just like decrementing callsLeft in the previous example
		post.value.commentOwners = [];
		post.value.commentTexts = [];
		db.getComment(JSON.stringify(commentID), function(err, commentData) {
			if (err) {
				console.log("error is: ", err);
			 	inner_callback(err);
			} else {
				var nameadd = (JSON.parse(commentData[0]['value']))['firstname'] + " " +
							  (JSON.parse(commentData[0]['value']))['lastname'];
				var comtext = (JSON.parse(commentData[0]['value']))['text'];
				post.value.commentOwners.push(nameadd);
				post.value.commentTexts.push(comtext);
			}
			inner_callback();
		});		
	}, function(err){
		// this function gets called when all items get processed
		// if any of them resulted in an error, we'll have an error here
		// otherwise, data will be a list
		if (err) {
			console.log("problem with comment callback: ", err);
		}
		callback(post);
	})
}

var doPosts = function (arr, posts, callback) {
	async.forEachOf(posts, function(post, key, inner_callback){
		var commentIDlist = JSON.parse(post.value.commentIDs);
		console.log("commentIDlist: ", post.value.commentIDs);
				doComments(post, commentIDlist, function(err) {
					inner_callback();
				});
	}, function(err){
		if (err) {
			console.log("problem with post callback:", err);
		}
		// this function gets called when all items get processed
		// if any of them resulted in an error, we'll have an error here
		// otherwise, data will be a list
		callback(err, posts)
	})
}


var getAjaxRestaurants = function(req, res) {

	db.getAllRestaurants(function(data, err) {
		if (err) {
			res.status(500).send(err);			
		} else if (data) {			
			res.send(JSON.stringify(data));			
		} else {
			res.status(500).send('Something broke!');	
		}
	});
};




var getSignup = function(req, res) {
	res.render('signup.ejs', {message: ''});
};

var postCreateAccount = function(req, res) {
	var userInput = req.body.userField;
	var passwordInput = req.body.passwordField; 
	var nameInput = req.body.nameField; 

	var firstname = req.body.firstNameField;
	var lastname = req.body.lastNameField;
	var email = req.body.emailAddressField;
	var password = req.body.passwordField; 

	// Check for empty fields 
	if (firstname == "" || lastname == "" || email == "" || password == "") {
		res.render('signup.ejs', {message: "Fill up the Empty Fields!"});
	} else {
		// Create value json object to put inside table
		var value = JSON.stringify({
		"firstname" : firstname,
		"lastname" : lastname,
		"password" : password,
		"status" : "",
		"affiliation" : "",
		"interests" : [],
		"birthday" : "",
		"online" : false,
		"posts" : [],
		"comments" : [],
		"friendposts" : []
		});
		// Call database to add user function
		db.putUser(email, value, function(data, err) {
			if (err) {
				res.render('signup.ejs', {message: err}); //Errors returned by KVS
			} else {
				//the data value will return the URL for the user (firstname.lastname.inx)
				//pass in the response from the server to our app function
				req.session.ID = data.userID;
				req.session.firstname = firstname;
				req.session.lastname = lastname;
				req.session.email = email;
				res.redirect('/restaurants');
			}
		});
	}
};

var postProfile = function(req, res) {

}

var postAddRestaurant = function(req, res) {

	console.log("postAddRestaurant called now ");
	var latInput = req.body.latField;
	var longInput = req.body.longField; 
	var nameInput = req.body.nameField; 
	var descInput = req.body.descField; 

	console.log("form data thats sent to server is: " + formData); 

	// Check for empty fields 
	if (latInput == "" || longInput == "" || nameInput == "" || descInput == "") {
		res.render('restaurants.ejs', {message: "Fill up the Empty Fields!"});
	} else {
		var value = JSON.stringify({
			'latitude' : latInput, 
			'longitude': longInput, 
			'description' : descInput, 
			'creator' : req.session.username
		});	

		db.putRestaurant(nameInput, value, function(data, err) {		
			res.redirect('/restaurants');
		});
	}
};

var postAjaxRestaurant = function(req, res) {	
	
	var latInput = req.body.latField;
	var longInput = req.body.longField;
	var nameInput = req.body.nameField;
	var descInput = req.body.descField;
	
	var value = JSON.stringify({
		'latitude' : latInput, 
		'longitude': longInput, 
		'description' : descInput, 
		'creator' : req.session.username
	});	

	db.putRestaurant(nameInput, value, function(err, data) {		
		console.log("data from db put restaurant call is: ", data);
		updatedValue = JSON.stringify({
			'latitude' : latInput, 
			'longitude': longInput, 
			'description' : descInput, 
			'creator' : req.session.username,
			'inx'	  : data,
			'title'   : nameInput
		});			
		res.send(updatedValue);
		console.log("updated value sent baack");
	});
};

var postDeleteRestaurant = function(req, res) {
	
	var keyword = req.body.key; 
	var inx = req.body.inx; 
	var blah = req.blah;
	console.log("before calling remove");
	console.log("inx is , ", inx);

	db.removeRestaurant(keyword, inx, function(err, data) { 				
		console.log(data);
	});
	res.send("");
};

var postAddComment = function(req, res) {
	var postID = req.params.postID;
	var text = req.params.commenttext;
	console.log("about to call db add comment!");
	console.log("params:", req.body); 
		console.log("params for postID and text:", req.body.postID); 
		console.log("params for postID and text:", req.body.commenttext); 
		console.log("req session firstname lastname", req.session.firstname, req.session.lastname);


	db.addComment(req.session.firstname, req.session.lastname, req.session.ID, postID, text, function(err, data) {
		console.log("finished calling db add comment!");
	})
}



var getLogout = function(req, res) {
	// Set Session user to empty 
	req.session.ID = ''; 
	req.session.firstname = '';
	req.session.lastname = '';
	req.session.email = '';
	// Redirect to main page 
	res.redirect('/');
};



/*
 *  When the user enters a username and password and submits the form, the server
should look up this combination in the users table. If the combination is valid, the user should
be redirected to http://yourServer/restaurants (see below), and the server should
remember (in the session object) that the user has logged in. If the username or the password is
not valid, or if one or both are missing (i.e., the corresponding fields were blank), the user should
be redirected back to the login page, and an error message should be shown (in red) that explains
what happened. 
 * 
 * 
 * 
 */
var routes = { 
		post_testrestaurants: postTestRestaurants,
		get_testMain : getTestMain,
		get_main: getMain,
		post_login: postLogin,
		post_restaurants: postRestaurants,			
		get_signup: getSignup,
		post_createAccount: postCreateAccount, 
		post_addRestaurant: postAddRestaurant, 
		get_logout: getLogout,
		post_ajaxRestaurant: postAjaxRestaurant,
		get_ajaxRestaurants: getAjaxRestaurants, 
		post_deleteRestaurant: postDeleteRestaurant,
		post_profile: postProfile,
		post_addcomment: postAddComment
};

module.exports = routes;
