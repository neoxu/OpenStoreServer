var ACS = require('acs').ACS;
var	logger = require('acs').logger; 
var	express = require('express');
var	partials = require('express-partials');
var global = require('global');

var allowCrossDomain = function(req, res, next) {	
	res.header('Access-Control-Allow-Origin', '*');
	//res.header('Access-Control-Allow-Credentials', true);
	res.header('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
	  
	// intercept OPTIONS method
	if ('OPTIONS' == req.method) {		
    	headers = req.header('Access-Control-Request-Headers');
    	res.header('Access-Control-Allow-Headers', headers);
		res.send(200);
	}
	else {	
		next();
	}
};

// initialize app (setup ACS library and logger)
function start(app) {		
	ACS.init('');
	logger.setLevel('DEBUG');	
	
	//use connect.session
	app.use(express.cookieParser());
	app.use(express.session({
		key : 'node.acs',
		secret : "my secret"
	}));
		
	//set favicon
	app.use(express.favicon(__dirname + '/public/images/favicon.ico'));	
		
	//set to use express-partial for view
	app.use(partials());	
	//Request body parsing middleware supporting JSON, urlencoded, and multipart
	app.use(express.bodyParser());		
	
	//pross cross origin
	app.use(allowCrossDomain);
	
	global.loadUserName();
}

// release resources
function stop() {

}
