var db = require('../models/database.js');
var async = require('async');


var getMain = function(req, res) {
	res.render('main.ejs', { 
		message: "", 
		footer: "Full Name: Wai Wu, SEAS Login: wuwc"
	});
};

var getTestMain = function(req, res) {
	res.render('index.ejs', { 
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
				username: "0", 
				message: null, 
				posts: posts
			});		
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
		if (err) {
			console.log("error:", err);
		}
		for (var i = 0; i < friends.length; i++) {
			console.log("friend: " + friends[i].value);
		}
		db.getPosts(function(err, posts) {
			console.log("GOT POSTS?");

			var postsString = []
			doPosts(postsString, posts, function(err, postsData) {
				console.log("post datas: ", postsData);
								console.log("post datas zero: ", postsData[0]);

				// for (var i = 0; i < postsData.length; i++) {
				// 	console.log("adding posts to postSTring: ", postsData[i]);
				// 	postsString[i] = (JSON.stringify(postsData[i]));
				// }
				console.log("should be rendering now");
				console.log("postsData will be: ", postsData);
								console.log("postsData comment owner will be: ", postsData[0]['value']['commentOwners']);
								console.log("postsData comment text will be: ", postsData[0]['value']['commentTexts']);

				res.render('restaurants.ejs', {username : req.session.ID, message : "", posts : postsData});
			});	
		});
	});
}

// var inner_callback = function(post, err, commentDatas) {
// 	if (err) {
// 		console.log("error with inner callback for comments: " + err);
// 	} else {
// 		console.log("----------------");
// 		console.log("post.value: ", post.value);
// //		post.value.commentOwners.push(commentData.value.owner);
// //		post.value.commentTexts.push(commentData.value.text);
// 	}
// }


var doComments = function (post, commentIDs, callback) {
	async.forEachOf(commentIDs, function(commentID, key, inner_callback){
		// this is the function that executes on every item in the list
		// we need to make sure inner_callback gets run exactly once per loop
		// so that async knows when the item has been processed
		// this is just like decrementing callsLeft in the previous example
		post.value.commentOwners = [];
		post.value.commentTexts = [];
		console.log(" FUCK THIS SHIT ");
		console.log("post.value.commentTexts:", post.value.commentTexts);
		var commentDatas = []
		db.getComment(JSON.stringify(commentID), function(err, commentData) {
							if (err) {
								console.log("error is: ", err);
							 	inner_callback(err);
							} else {
								console.log("commentdata:", commentData);
								console.log("sub values of comment data is: ", JSON.parse(commentData[0].value));
								console.log("first name is...:" + (JSON.parse(commentData[0]['value']))['firstname']);
								var nameadd = (JSON.parse(commentData[0]['value']))['firstname'] + " " +
													(JSON.parse(commentData[0]['value']))['lastname'];
								var comtext = (JSON.parse(commentData[0]['value']))['text'];
								post.value.commentOwners.push(nameadd);
								post.value.commentTexts.push(comtext);


								console.log("post value after for each comment adding is: ", post.value);
								console.log("post value after for each comment adding is: ", post.value.commentOwners);

								

							 }



							console.log("finished getting a comment? commentData: ", commentData[0]);
							
							console.log("finished getComment callback");
	//						commentDatas[key] = commentData[0]
									inner_callback();

							
		});		


	}, function(err){
		console.log("doing outer callback for comments")
		// this function gets called when all items get processed
		// if any of them resulted in an error, we'll have an error here
		// otherwise, data will be a list
		if (err) {
			console.log("problem with comment callback: ", err);
		}
		console.log("POST: ", post);
		callback(post);
	})
}

var doPosts = function (arr, posts, callback) {
	async.forEachOf(posts, function(post, key, inner_callback){
		var commentIDlist = JSON.parse(post.value.commentIDs);
				doComments(post, commentIDlist, function(err, commentDatas) {
					console.log("Done and moving on to posts callback--------------------------");
					console.log("commentDatas: ", commentDatas);
					// var postString = [];
					// post.value.commentOwners = [];
					// post.value.commentTexts = [];
					// for (var j = 0; j < array.length; j++) {
					// 	post.value.commentOwners.push(commentDatas[j].value.owner);
					// 	post.value.commentTexts.push(commentDatas[j].value.text);
					// }

					// for (var k = 0; k < posts.length; k++) {
					// 	posts[k].value.commentOwners = [];
					// 	posts[k].value.commentTexts = [];
					// 	var array = JSON.parse(posts[i].value.commentIDs);
					// 	console.log("array: ", array.length);
					// 	for (var j = 0; j < array.length; j++) {
					// 		posts[k].value.commentOwners.push(commentDatas[i]);
					// 		posts[k].value.commentTexts.push(JSON.stringify(j));
					// 	}
					// 	console.log("post i : ", posts[i]);
					// 	postString.push(JSON.stringify(posts[i]));
					// }
					console.log("comment Datas in the callback: ", commentDatas);
//					post.comment = commentDatas[0]
					inner_callback();
				});
				
	}, function(err){
		if (err) {
			console.log("problem with post callback:", err);
		}
		console.log("doing outer callback for posts")
		// this function gets called when all items get processed
		// if any of them resulted in an error, we'll have an error here
		// otherwise, data will be a list
		console.log("called back post datas: ", posts);
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
		post_testrestaurants: postTestRestaurants,
		get_testMain : test,
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
