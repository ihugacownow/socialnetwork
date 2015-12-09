var db = require('../models/database.js');

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
				req.session.username = userInput; 
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


var postRestaurants = function(req, res) {
	//If the user is not logged in, redirect him to login
	if (req.session.username == "") {
		res.render('main.ejs', {
			message: "", 
			footer: "Full Name: Wai Wu, SEAS Login: wuwc"
		});
	} 	

	db.getAllRestaurants(function(data, err) {
		if (err) {
			res.render('logincheck.ejs', {
				userInput: userInput, 
				message: err, 
				result: null
			});
		} else if (data) {
			res.render('restaurants.ejs', {
				username: req.session.username, 
				message: null, 
				data: data
			});
		} else {
			res.render('logincheck.ejs', {
				userInput: userInput, 
				result: null, 
				message: 'User name and password invalid '
			});
		}
	});
};

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
	if (userInput == "" || passwordInput == "" || nameInput == "") {
		res.render('signup.ejs', {message: "Fill up the Empty Fields!"});
	} else {
		// Create value json object to put inside table
		var value = JSON.stringify({
		"firstname" : firstname,
		"lastname" : lastname,
		"email" : email,
		"password" : password,
		"status" : status,
		"affiliation" : "",
		"interests" : [],
		"birthday" : "",
		"online" : false,
		"posts" : [0],
		"comments" : [],
		"friendposts" : [0]
		});
		// Call database to add user function
		db.putUser(value, function(data, err) {
			if (err) {
				res.render('signup.ejs', {message: err}); //Errors returned by KVS
			} else {
				//the data value will return the URL for the user (firstname.lastname.inx)
				//pass in the response from the server to our app function
				req.session.username = 
				res.redirect('/')
			}
		})

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
