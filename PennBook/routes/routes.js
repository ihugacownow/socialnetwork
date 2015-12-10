var db = require('../models/database.js');
var async = require('async');


var getMain = function(req, res) {
	res.render('main.ejs', { 
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
				req.session.ID = data; 
				res.redirect('/restaurants');			
			} else {
				// Should not hit this case 
				res.render('main.ejs', {
					userInput: userInput, 
					message: 'Null Data', 
					footer: "Full Name: Wai Wu, SEAS Login: wuwc"
				});
			}
		});
	}
};

var test = function(req, res) {

	db.getComment("0", function(err, commentData) {

						console.log("finished getting a comment? commentData: " + JSON.stringify(commentData));
			//			commentTexts.push(commentData.value.text);
			//			commentOwners.push(commentData.value.firstname + " " + commentData.value.lastName);
						hasFinished= true;
						
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
		for (var i = 0; i < friends.length; i++) {
			console.log("friend: " + friends[i].value);
		}
		db.getPosts(function(err, posts) {
			console.log("GOT POSTS?");
			for (var i = 0; i < posts.length; i++) {
				var commentOwners = [];
				var commentTexts = []
				var array = JSON.parse(posts[i].value.commentIDs);
				for (var j = 0; j < array.length; j++) {
					commentOwners.push(JSON.stringify(j));
					commentTexts.push(JSON.stringify(j));
				}
				posts[i].commentOwners = commentOwners;
				posts[j].commentTexts = commentTexts;
			}
			// for (var i = 0; i < posts.length; i++) {
			// 	//commentTexts
			// 	var hasFinished = false;
			// 	var commentsOwners = []; //we change the json objects list of reply IDs their corresponding text
			// 	var commentTexts = []; //
//				console.log("POST i object: " + JSON.stringify(posts[i]) + "length: " + JSON.parse(posts[i].value.commentIDs).length);
//				for (var k = 0; k < (JSON.parse(posts[i].value.commentIDs)).length; k++) {
//					console.log("POST i object's comment IDs: " + posts[i].value.commentIDs[k]);
//				}
				var array = JSON.parse(posts[i].value.commentIDs);
				// for (var j = 0; j < array.length; j++) {
				// 	console.log("about to call db.get comment");
				// 	db.getComment(JSON.stringify(array[j]), function(err, commentData) {

									// doLotsOfStuff(array, function() {
									// 	console.log("Done--------------------------");
									// });
									
									// Wai commening out 
									// async.forEach(array, function(elm , ){
									// 		// do stuff 
									// 		db.getComment("0", function(err, commentData) {

				// 		console.log("finished getting a comment? commentData: " + JSON.stringify(commentData));
				// 		commentTexts.push(commentData.value.text);
				// 		commentOwners.push(commentData.value.firstname + " " + commentData.value.lastName);
				// 		hasFinished= true;
						
				// 		});

				// 	while (hasFinished == false) {};
				// 	hasFinished = false;
				// }
				// var hasFinished = false;
				// while (hasFinished == false) {
				// 	if (commentTexts.length == posts[i].value.commentIDs.length) {
				// 		hasFinished = true;
				// 		posts[i].commentTexts = commentTexts;
				// 		posts[i].commentOwners = commentOwners;
				// 	}
			// 	}
			// }
			// for (var i = 0; i < posts.length; i++) {
			// 	console.log("FULL POST INFO: " , posts[i]);
			// }
			res.render("restaurants.ejs", {posts: posts});
		})
	})
};


// var doLotsOfStuff = function (list, callback) {
// 	async.forEachOf(list, function(itemInList, inner_callback){
// 		// this is the function that executes on every item in the list
// 		// we need to make sure inner_callback gets run exactly once per loop
// 		// so that async knows when the item has been processed
// 		// this is just like decrementing callsLeft in the previous example
// 										console.log("fjor each in ", [0,1]); 

// 		db.getComment("0", function(err, commentData) {
// 							if (!err) 
// 								console.log("comment data is: ", commentData); 
// 							else 
// 							 	console.log("error is: ", err); 


// 							console.log("finished getting a comment? commentData: " + JSON.stringify(commentData));
// 					//		commentTexts.push(commentData.value.text);
// 			//				commentOwners.push(commentData.value.firstname + " " + commentData.value.lastName);
// 							hasFinished= true;
// 							console.log("finished getComment callback");
							
// 		});		
// 	}, function(err, commentDatas){
// 		console.log("doing outer callback")
// 		// this function gets called when all items get processed
// 		// if any of them resulted in an error, we'll have an error here
// 		// otherwise, data will be a list
// 		callback(err, commentDatas)
// 	})
// }


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
	// var userInput = req.body.userField;
	// var passwordInput = req.body.passwordField; 
	// var nameInput = req.body.nameField; 

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
				res.redirect('/restaurants');
			}
		});


		// // Create value json object to put inside table 
		// var value = JSON.stringify({
		// 	'password' : passwordInput, 
		// 	'fullname': nameInput
		// });	
		// // Call database put user function 
		// db.putUser(userInput, value, function(data, err) {
		// 	if (err) {
		// 		// errors returned by kvs.exists function 
		// 		res.render('signup.ejs', {message: err});
		// 	} else if (data) {			
		// 		// If signup successful, update session username and redirect to rest 
		// 		req.session.username = userInput; 
		// 		res.redirect('/restaurants');			
		// 	} else {
		// 		// When both err and data are null, user already exists  
		// 		res.render('signup.ejs', {message: "User Already Exists!"});
		// 	}
		// });
	}
};

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



var getLogout = function(req, res) {
	// Set Session user to empty 
	req.session.username = ''; 
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
		get_main: getMain,
		post_login: postLogin,
		post_restaurants: postRestaurants,			
		get_signup: getSignup,
		post_createAccount: postCreateAccount, 
		post_addRestaurant: postAddRestaurant, 
		get_logout: getLogout,
		post_ajaxRestaurant: postAjaxRestaurant,
		get_ajaxRestaurants: getAjaxRestaurants, 
		post_deleteRestaurant: postDeleteRestaurant
};

module.exports = routes;
