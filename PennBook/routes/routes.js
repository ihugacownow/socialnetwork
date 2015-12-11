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
				req.session.email = userInput; 
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
		req.session.friends = friends; //set user's friend list
		var friendsArr = [];
		for (var i = 0; i < friends.length; i++) {
			friendsArr.push(friends[i].value);
		}
		if (err) {
			console.log("error:", err);
		}
		db.getPosts(function(err, posts) {
			console.log("posts array that db gave us: ", posts);
			var postsString = []
			doPosts(postsString, posts, function(err, postsData) {
				console.log("post data from doPostsstts data , " , postsData);
				var filteredPosts = []
				for (var i = 0; i < postsData.length; i++) {
					if (contains(postsData[i].value.owner1, friends) !== -1 ||
						contains(postsData[i].value.owner2, friends) !== -1) {
						console.log("WE HAVE A VIEWABLE POST");
						filteredPosts.push(postsData[i]);
					}

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
	var arr1 = []
	var arr2 = []
	async.forEachOf(commentIDs, function(commentID, key, inner_callback){
		// this is the function that executes on every item in the list
		// we need to make sure inner_callback gets run exactly once per loop
		// so that async knows when the item has been processed
		// this is just like decrementing callsLeft in the previous example
		db.getComment(JSON.stringify(commentID), function(err, commentData) {
			if (err) {
				console.log("error is: ", err);
			 	inner_callback(err);
			} else {
				var nameadd = (JSON.parse(commentData[0]['value']))['firstname'] + " " +
							  (JSON.parse(commentData[0]['value']))['lastname'];
				var context = (JSON.parse(commentData[0]['value']))['text'];
				arr1.push(nameadd);
				arr2.push(context);
			}
			inner_callback();
		});		
	}, function(err){
		console.log("arr1: ", arr1);
		post.value.commentOwners = arr1;
		post.value.commentTexts = arr2;
		console.log("current post's commentOwners: ", post.value.commentOwners);
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

		var commentIDlist = post.value.commentIDs;
		console.log("commentIDlist: ", post.value.commentIDs);
				doComments(post, JSON.parse(commentIDlist), function(err) {
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

//add a comment to a post
var postAddComment = function(req, res) {
	var text = req.body.text;
	var postID = req.body.postID;
	var firstname = req.body.firstname;
	var lastname = req.body.lastname;
	var userID = req.body.userID;
	var postInx = req.body.postInx;
	db.addComment(postInx, firstname, lastname, userID, postID, text, function(err, data) {
		res.send(JSON.stringify(data));					
	});					
}

//load a user'sprofile (when user clicks on their "profile" button OR they search for another user)
var postProfile = function(req, res) {
	var themID = req.body.ID; //id of the person who's profile page you're on
	var youID = req.session.ID; //id of the person logged in
	db.getPosts(function(err, posts) {
			var postsString = []
			doPosts(postsString, posts, function(err, postsData) {
				var filteredPosts = []
				for (var i = 0; i < postsData.length; i++) {
					//only include posts such that the user is owner2 (he was sent the post)
					if (postsData[i].value.owner2 == themID) {
						filteredPosts.push(postsData[i]);
					}

				}
				//finally, determine what type of friend request button to send
				//0=add friend, 1=request sent, 2=already added, 3=fan of you!
				var youToThem = false;
				var themToYou = false;
				db.allFriends(function(err, friends) {
					if (err) {
						console.log("couldn't load friends key/values!");
					} else {
						for (var i = 0; i < friends.length; i++) {
							if (friends[i].key == themID && friends[i].value == youID) {
								themToYou = true;
							}
							if (friends[i].key == youID && friends[i].value == themID) {
								youToThem = true;
							}
						}

					}
					var val;
					if (youToThem && themToYou) {
						val = 2;
					} else if (youToThem) {
						val = 1;
					} else if (themToYou) {
						val = 3;
					} else {
						val = 0;
					}
					//also get the user's value fields (must display these if it is current user)
					db.lookupUser(req.session.id, function(userData, err) {
						res.render('profile.ejs', {session : req.session, userObject: userData.value, friendInt : val, message : "", posts : postsData});
					})
				})
			});	
		});
}

//search for a user (sends front-end a list of users + their webpages)
//returns all the userIDs of any user's who match the given first and last name
var postSearch = function(req, res) {
	var firstname = req.body.firstname;
	var lastname = req.body.lastname;
	//get the key-value pairs of all users
	db.getUsers(function(err, users) {
		if (err) {
			console.log("error getting list of users: " + err);
		} else {
			//make an array of all the users with the given first and last name
			var validUsers = [];
			for (var i = 0; i < users.length; i++) {
				console.log("Users[i].value is: ", users[i].value);
				if (users[i].value.firstname == firstname && users[i].value.lastname == lastname) {
					validUsers.push({"firstname": firstname, "lastname": lastname, "ID": users[i].key});
				}
			}
			res.send(validUsers);
		}
	});
}

//upon "reading" their notifications, we will empty the user's notification list
 var getNotifications = function(req, res) {
	//get the notifications
	db.lookupUser(req.session.email, req.session.password, function(userData, err) {
		if (err) {
			console.log("error looking up user!" + err);
		} else {
			//set the notifications array for the current user to be empty
			db.updateNotifications(req.session.email, req.session.ID, {"notifications": []}, function(data, err) {
				if (err) {
					console.log("error updating notifications!" + err);
				} else {
					//send the user the original notifications array
					var json = JSON.parse(userData.value);
					res.send({"notifications": userData.notifications});
				}
			})
		}
	})
}

//used to refresh a newsfeed without refreshin the entire page
var getPostsAjax = function(req, res) {
	db.getFriends(req.session.ID, function(err, friends) {
		req.session.friends = friends; //set user's friend list
		var friendsArr = []; //contains the userIDs of all the friends of given user
		for (var i = 0; i < friends.length; i++) {
			friendsArr.push(friends[i].value);
		}
		if (err) {
			console.log("error:", err);
		}
		//get all the posts
		db.getPosts(function(err, posts) {
			console.log("posts array that db gave us: ", posts);
			var postsString = []
			doPosts(postsString, posts, function(err, postsData) {
				console.log("post data from doP")
				var filteredPosts = []
				//only include posts such that one of the owners is friends with the user
				for (var i = 0; i < postsData.length; i++) {
					if (contains(postsData[i].value.owner1, friends) !== -1 ||
						contains(postsData[i].value.owner2, friends) !== -1) {
						console.log("WE HAVE A VIEWABLE POST");
						filteredPosts.push(postsData[i]);
					}
				}
				res.send(JSON.stringify({session : req.session, message : "", posts : postsData}));
			});	
		});
	});
}

//function for adding posts to our post table (when posting on a user's wall)
var postAddPost = function(req, res) {
	var owner1 = req.body.owner1;
	var owner2 = req.body.owner2;
	var text = req.body.text;
	db.addPost(owner1, owner2, text, function(err, data) {
		if (err) {
			console.log("error adding post: ", err);
		} else {
			//send back the ID of the post so front-end can use it to make a unique div
			res.send({"postID": data});
		}
	})

}

//function for adding a friend (when user clicks on someone else's friend request button)
var postAddFriend = function(req, res) {
	var user1 = req.session.ID; //person doing the friending
	var user2 = req.body.user2; //person being friended
	//add this tuple to the friends data table
	db.addFriend(user1, user2, function(err, data) {

	})
}


var getLogout = function(req, res) {
	// Set Session user to empty 
	req.session.ID = ''; 
	req.session.firstname = '';
	req.session.lastname = '';
	req.session.email = '';
	req.session.friends = '[]';
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
		post_testRestaurants: postTestRestaurants,
		test: postTestRestaurants,
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
		post_addcomment: postAddComment,
		post_profile: postProfile,
		post_search: postSearch,
		get_notifications: getNotifications,
		get_postsAjax: getPostsAjax,
		post_addpost: postAddPost,
		post_addfriend: postAddFriend
};

module.exports = routes;
