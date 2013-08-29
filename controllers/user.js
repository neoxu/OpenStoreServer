var ACS = require('acs').ACS;
var logger = require('acs').logger;
var database = require('/controllers/database');

function fbLogin(req, res) {
	console.log('fb login: ' + req.body.email);
	req.body.un = req.body.email+'@fb.g';
 	req.body.pw = '1234'; 
  
	ACS.Users.login({
		login : req.body.un,
		password : req.body.pw
	}, function(data) {
		if (data.success) {
			var user = data.users[0];			
			user.name = user.first_name;
			req.session.flash.r = 1;
			req.session.flash = {
				msg : "Hello " + user.name + ".",
				r : 0
			};
			req.session.user = user;
			res.send({});
			logger.info('User logged in: ' + user.name);
		} else {	
						
			var data = {
				first_name : req.body.email,
				last_name : 'fb',
				name : req.body.email,
				email : req.body.email+'@fb.g',
				password : '1234',
				password_confirmation : '1234'
			};

			ACS.Users.create(data, function(data) {
				if (data.success) {
					var user = data.users[0];
					user.name = user.username;					
					req.session.user = user;					
					logger.info('Created user: ' + user.name);
					
					req.body.account =  req.body.email;
					req.body.pw = '1234';
					req.body.name = req.body.email;
					database.updataUser(req, res);
					res.send({});
				} else {
					res.send({err: 'se2'});
				}
			}, req, res); 
		}
	}, req, res); 
}

function signup(req, res) {
  var data = {
    first_name: req.body.first_name,
    last_name: req.body.last_name,
    email: req.body.email,
    password: req.body.pw,
    password_confirmation: req.body.pw_c
  };
  
  ACS.Users.create(data, function(data) {
    if(data.success) {
      var user = data.users[0];
      user.name = user.last_name + user.first_name;      
      req.session.user = user;
      //res.redirect('/');
      res.send({});
      logger.info('Created user: ' + user.name);
      
      
	  req.body.account = user.email;
	  req.body.pw = req.body.pw;
	  req.body.name = user.name;
	  database.updateUser(req); 

    } else {
      res.send({err: 'se2'});	 
      /*req.session.flash = {msg:data.message, r:0};
      req.session.controller = "signup"
      res.render('login', {
        layout: 'application',
        req: req
      });
      */
    }
  }, req, res);
}
