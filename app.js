var ACS = require('acs').ACS, 
	logger = require('acs').logger, 
	express = require('express'), 
	partials = require('express-partials');

var allowCrossDomain = function(req, res, next) {	
	//console.log('req.method: ' + req.method);	
	// intercept OPTIONS method
	if ('OPTIONS' == req.method) {		
		var origin = req.header('Origin');
		if(!origin){
        	return next();
      	}
      
		res.header('Access-Control-Allow-Origin', origin);
		res.header('Access-Control-Allow-Credentials', 'true');
		res.header('Access-Control-Allow-Methods', 'GET,HEAD,PUT,POST,DELETE,OPTIONS');
    	
    	headers = req.header('Access-Control-Request-Headers');
    	res.header('Access-Control-Allow-Headers',headers);	
		res.header('Access-Control-Max-Age', '12000');   	
    			
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
}

// release resources
function stop() {

}
