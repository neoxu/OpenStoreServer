var MongoClient = require('mongodb').MongoClient;
var format = require('util').format;
var urlNiceMarket = format('');
var url = format('');
var reservationCollection = 'reservation';
var usersCollection = 'users';
var customCollection = 'customs';
var storesCollection = 'stores';
var worksCollection = 'works';

var http = require('http');
var	util = require('util'); 
		
function dbUpdate(dbUrl, collectionName, query, doc, res) {	
	
	function updateCallback(err) {
		if (!err) {
			console.log(collectionName + ' update success');
			if (res)
				res.send('1');
		} else {
			console.log(collectionName + ' update fail ' + err);
			if (res)
				res.send('0');
		}
	}

	MongoClient.connect(dbUrl, function(err, db) {
		if (!err) {			
			if (db != null) {
				var collection = db.collection(collectionName);
				if (collection != null) {		
					collection.update(query, doc, {upsert : true}, updateCallback);
				} else
					console.log(collectionName + ' not found');
			} else
				console.log(dbUrl + ' not found');
		} else
			console.log(dbUrl + ' connect fail ' + err);
	});
}

function dbfind(dbUrl, collectionName, query, fields, sortParam, res) {
	MongoClient.connect(dbUrl, function(err, db) {
		if (!err) {			
			if (db != null) {
				var collection = db.collection(collectionName);
				if (collection != null) {					
					var myCursor = collection.find(query, fields).sort(sortParam); 
					
					myCursor.toArray(function(err, docs) {
						if (!err)							
							res.send(docs);		
						else
						    res.send('se3');
					});    
				} else
					console.log(collectionName + ' not found');
			} else
				console.log(dbUrl + ' not found');
		} else
			console.log(dbUrl + ' connect fail ' + err);		
	});
}

function dbfindOne(dbUrl, collectionName, query, fields, callBack) {
	MongoClient.connect(dbUrl, function(err, db) {
		if (!err) {			
			if (db != null) {
				var collection = db.collection(collectionName);
				if (collection != null) {					
					collection.findOne(query, fields, callBack); 
				} else
					console.log(collectionName + ' not found');
			} else
				console.log(dbUrl + ' not found');
		} else
			console.log(dbUrl + ' connect fail ' + err);		
	});
}
			
function doRemove(dbUrl, collectionName, query, res) {	
	
	function removeCallback(err) {
		if (!err) {
			res.send('1');
			console.log(collectionName + ' remove success ');
		} else {
			console.log(collectionName + ' remove fail ' + err);
		}
	}	

	MongoClient.connect(dbUrl, function(err, db) {
		if (!err) {			
			if (db != null) {
				var collection = db.collection(collectionName);
				if (collection != null) {			
					collection.remove(query, true, removeCallback);						
				} else
					console.log(collectionName + ' not found');
			} else
				console.log(dbUrl + ' not found');
		} else
			console.log(dbUrl + ' connect fail ' + err);	
	});
}
		
function findUser(req, res) {	
	var query = {account : req.session.user.email};
	var fields = {"_id": 0};
	var sortParam = {};
	dbfindOne(urlNiceMarket, usersCollection, query, fields, checkUser);
	
	function checkUser(err, user) {
		res.send(user);
	}
}

exports.findUserData = function(req, res) {
	var query = {account : req.session.user.email};
	var fields = {"_id": 0};
	var sortParam = {};
	dbfindOne(urlNiceMarket, usersCollection, query, fields, checkUser);
	
	function checkUser(err, user) {
		return user;
	}
};

function updateUser(req, res) {		
	if (req.body.account && req.body.pw && req.body.name) {
		var doc = {};
		doc['account'] = req.body.account;
		doc['pw'] = req.body.pw;
		doc['name'] = req.body.name;

		var query = {account : req.body.account};
		
		dbUpdate(urlNiceMarket, usersCollection, query, doc, res);
	} else
		res.send('se2');
}

exports.updateUser = updateUser;

function updateCustoms(req, res) {
	MongoClient.connect(url, function(err, db) {
		if (!err) {			
			if (db != null) {
				var collection = db.collection(customCollection);
				if (collection != null) {
					var succCount = 0;
					var recCount = req.body.docs.length;
						
					for (var i = 0; i < recCount; i++) {
						var doc = {};
						doc['userid'] = req.session.user.id;
						if (req.body.docs[i].name) 
							doc['name'] = req.body.docs[i].name;
							
						if (req.body.docs[i].phone) 
							doc['phone'] = req.body.docs[i].phone;
							
						if (req.body.docs[i].birthday) 
							doc['birthday'] = req.body.docs[i].birthday;
							
						if (req.body.docs[i].email) 
							doc['email'] = req.body.docs[i].email;
							
						if (req.body.docs[i].fb) 
							doc['fb'] = req.body.docs[i].fb;
							
						if (req.body.docs[i].line) 
							doc['line'] = req.body.docs[i].line;
							
						if (req.body.docs[i].google) 
							doc['google'] = req.body.docs[i].google;
							
						if (req.body.docs[i].skype) 
							doc['skype'] = req.body.docs[i].skype;
						
						var query = {userid : req.session.user.id, name : req.body.docs[i].name};
						collection.update(query, doc, { upsert: true}, updateCallback);
					}								
					
					function updateCallback(err) {
						if (!err) {
							console.log('insert success ');
							
							succCount++;
							if (succCount >= recCount)
								res.send('1');
						}
						else
						{
							console.log('insert fail ' + err);
						}
					}					
				}
			}
		}
	});
}

function findCustoms(req, res) {	
	var query = {userid : req.session.user.id};
	var fields = {"_id": 0};
	var sortParam = {name:1};
	dbfind(url, customCollection, query, fields, sortParam, res);
}

function removeCustom(req, res) {	
	var query = {userid : req.session.user.id, name : req.body.delname};
	doRemove(url, customCollection, query, res);
}

function findReservation(req, res) {
	var query = {userid : req.session.user.id, date : {$in:req.body.dateay}};
	var fields = {_id: 0, date: '', custom: '', project: '', h: '', m: ''};
	var sortParam = {h:1, m:1};
	dbfind(url, reservationCollection, query, fields, sortParam, res);	
}

function updateReservation(req, res) {					
	if (req.body.date && req.body.custom && req.body.h && req.body.m) {
		var doc = {};
		doc['userid'] = req.session.user.id;
		doc['date'] = req.body.date
		doc['custom'] = req.body.custom;
		doc['project'] = req.body.project;
		doc['h'] = req.body.h;
		doc['m'] = req.body.m;

		var query = {
			userid : req.session.user.id,
			date : req.body.date,
			custom : req.body.custom
		};
		
		dbUpdate(url, reservationCollection, query, doc, res);
	} else 
		res.send('se2');		
}

function removeReservation(req, res) {	
	var query = {userid : req.session.user.id, 
				 date : req.body.date, 
				 custom: req.body.custom};
	doRemove(url, reservationCollection, query, res);
}

function findStores(req, res) {
	var query = {members : {$elemMatch:{account:req.session.user.email}}};	
	var fields = {_id: 0};
	var sortParam = {};
	dbfind(url, storesCollection, query, fields, sortParam, res);
}

function updateStore(req, res) {					
	if (req.body.storeName) {
		var doc = {};
		doc['owner'] = req.session.user.email;
		doc['ownerName'] = req.session.user.name;
		doc['storeName'] = req.body.storeName;

		if (req.body.storeUrl)
			doc['storeUrl'] = req.body.storeUrl;

		var may = new Array();
		var m = {account: req.session.user.email, name: req.session.user.name};
		may.push(m);
		doc['members'] = may;

		var query = {
			owner : req.session.user.email,
			storeName : req.body.storeName
		};		
		
		dbUpdate(url, storesCollection, query, doc, res);
		
		var workQuery = {
			account : req.session.user.email,
			name : req.session.user.name
		};		
		
		var work = { $set: {
			account : req.session.user.email,
			name : req.session.name
		}};
		dbUpdate(url, worksCollection, workQuery, work);				
	} else
		res.send('se2');										
}

function updateInviteMember(req, res) {
	if (req.body.owner && req.body.storeName && req.body.inviteName) {
		if (req.body.owner == req.session.user.email) {
			var userName = '';
			var query = {account : req.body.inviteName};
			var fields = {_id : 0};
			dbfindOne(urlNiceMarket, usersCollection, query, fields, checkUser);
		
			function checkUser(err, user) {	
				if (!err && user) {
					userName = user.name;
					var query = {owner : req.body.owner, storeName : req.body.storeName};
					var fields = {_id : 0};
					dbfindOne(url, storesCollection, query, fields, checkStore);
				} else
					res.send('se5');
			}
						
			function checkStore(err, store) {	
				if (!err && store) {
					var join = false;

					if (store.members) {
						store.members.forEach(function(m) {
							if (m.account == req.body.inviteName) {
								join = true;
							}
						});
					}

					if (store.waiting) {
						store.waiting.forEach(function(m) {
							if (m == req.body.inviteName) {
								join = true;
							}
						});
					}

					if (join == false) {
						var doc = {};
						doc['owner'] = store.owner;
						doc['storeName'] = store.storeName;
						doc['storeUrl'] = store.storeUrl;
						doc['members'] = store.members;						
						
						if (!store.waiting) 
						  store.waiting = new Array();
						  
						var m = {account: req.body.inviteName, name: userName}
						store.waiting.push(m);
						doc['waiting'] = store.waiting;

						var query = {owner : req.body.owner, storeName : req.body.storeName};

						dbUpdate(url, storesCollection, query, doc, res);
						res.send(userName);
						
						console.log(util.inspect(http.Server(req.app).connections, true, null, true));
					} else
						res.send('se4');
				} else
					res.send('se6');
			}
		
		} else
		    res.send('se2');
	} else
		res.send('se2');
}

function findInviteStore(req, res) {
	var query = {waiting : {$elemMatch:{account:req.session.user.email}}};	
	var fields = {_id: 0, waiting: 0};
	var sortParam = {};
	dbfind(url, storesCollection, query, fields, sortParam, res);
}

function updateInviteStore(req, res) {	
	if (req.body.storeName && req.body.owner) {
		var query = {owner : req.body.owner, storeName : req.body.storeName};
		var fields = {_id : 0};
		dbfindOne(url, storesCollection, query, fields, checkStore);

		function checkStore(err, store) {
			if (!err && store) {				
				var index = -1;
				if (store.waiting) {					
					for (var i in store.waiting) {									
						if (store.waiting[i].account === req.session.user.email) {
							index = i;
							break;
						}				
					}
				}
				
				if (index >= 0) {
					store.waiting.splice(index, 1);
					if (req.body.answer === 1) {
						var member = {
							account : req.session.user.email,
							name : req.session.user.name
						};
						store.members.push(member);
					}

					var query = {
						owner : store.owner,
						storeName : store.storeName
					};

					dbUpdate(url, storesCollection, query, store, res);
				}		
			}
		}
	}
}

function findMyWork(req, res) {
	var query = {account : req.session.user.email};	
	var fields = {_id: 0};
	dbfindOne(url, worksCollection, query, fields, function(work) {
		if (work) {
			res.send(work);
		}
		else
			res.send('se7');
	});
}

function findWorks(req, res) {
	var query = {name : {$regex: req.body.name+'.*', $options: 'i'}};	
	var fields = {_id: 0, pw: 0};
	var sortParam = {name:1};
	dbfind(urlNiceMarket, usersCollection, query, fields, sortParam, res);
}

function updateJoinWork(req, res) {
	if (req.body.account) {
		var query = {account : req.body.account};	
		var fields = {_id: 0};
		dbfindOne(url, worksCollection, query, fields, checkWork);
		
		function checkWork(work) {
			console.log(work)
			if (work) {
				if (work.customs) {
					for (var i in work.customs) {
						if (work.customs[i].account === req.session.user.email) {
							res.send('sc8');
							return;
						}
					}
				}
				
				if (work.waiting) {
					for (var i in work.waiting) {
						if (work.waiting[i].account === req.session.user.email) {
							res.send('sc9');
							return;
						}
					}					
					
					var member = {
						account : req.session.user.email,
						name : req.session.user.name
					}; 

					work.waiting.push(member);
					var query = {account : req.body.account};	
					dbUpdate(url, worksCollection, query, work, res);
				}			
			}
			else {
				res.send('sc7')
			}
		}
	}
}
