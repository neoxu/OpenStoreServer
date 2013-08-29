var MongoClient = require('mongodb').MongoClient;
var format = require('util').format;
var global = require('global');
var urlNiceMarket = format('');
var url = format('');
var reservationCollection = 'reservation';
var usersCollection = 'users';
var customCollection = 'customs';
var customersCollection = 'customers';
var storesCollection = 'stores';
var worksCollection = 'works';

function setUserName(user) {			
	if (user.account)
		user.name = global.getUserName(user.account);

	if (user.owner)
		user.name = global.getUserName(user.owner);

	if (user.members) {
		for (var i in user.members)
		if (user.members[i].account)
			user.members[i].name = global.getUserName(user.members[i].account);
	}

	if (user.waiting) {
		for (var i in user.waiting) {
			if (user.waiting[i].account)
				user.waiting[i].name = global.getUserName(user.waiting[i].account);
		}
	}

	if (user.works) {
		for (var i in user.works) {
			if (user.works[i].account)
				user.works[i].name = global.getUserName(user.works[i].account);
		}
	}
	
	if (user.customers) {
		for (var i in user.customers) {
			if (user.customers[i].account)
				user.customers[i].name = global.getUserName(user.customers[i].account);
		}
	}
}
		
function dbUpdate(dbUrl, collectionName, query, doc, res) {	
	
	function updateCallback(err) {
		if (!err) {
			console.log(collectionName + ' update success');
			if (res)
				res.send({});
		} else {
			console.log(collectionName + ' update fail ' + err);
			if (res)
				res.send({err: 'se2'});
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
						if (!err) {				
							for (var i in docs) {
								setUserName(docs[i]);
							}	
									
							res.send({doc: docs});
						}		
						else
						    console.log(collectionName + ' find error ' + err);
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
			res.send({});
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
		res.send({doc:user});
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

function updateUser(req) {		
	if (req.body.account && req.body.pw && req.body.name) {
		global.addUserName(req.body.account, req.body.name);
		var query = {account : req.body.account};
		var user = {account: req.body.account, pw: req.body.pw, name: req.body.name};		
		dbUpdate(urlNiceMarket, usersCollection, query, user);				
		
		var work = {account : req.session.user.email};
		dbUpdate(url, worksCollection, query, work);			
		dbUpdate(url, customersCollection, query, work);		
	}
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
								res.send({});
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
	var fields = {_id: 0};
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
		doc['date'] = req.body.date;
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
		res.send({err: 'se2'});		
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
		doc['storeName'] = req.body.storeName;

		if (req.body.storeUrl)
			doc['storeUrl'] = req.body.storeUrl;

		var may = [{account: req.session.user.email}];
		doc['members'] = may;
		
		var days = new Array();
		for (var i = 0; i < 7; i ++) {
			day = {open: true, startH: 9, startM: 0, endH: 21, endM: 0};
			days.push(day);			
		}
		
		doc['openTime'] = days;

		var query = {
			owner : req.session.user.email,
			storeName : req.body.storeName
		};		
		
		dbUpdate(url, storesCollection, query, doc, res);				
	} else
		res.send({err: 'se2'});										
}

function updateInviteMember(req, res) {
	if (req.body.owner && req.body.storeName && req.body.inviteName) {
		if (req.body.owner == req.session.user.email) {
			var query = {account : req.body.inviteName};
			var fields = {_id : 0};
			dbfindOne(urlNiceMarket, usersCollection, query, fields, checkUser);
		
			function checkUser(err, user) {	
				if (!err && user) {
					var query = {owner : req.body.owner, storeName : req.body.storeName};
					var fields = {_id : 0};
					dbfindOne(url, storesCollection, query, fields, checkStore);
				} else
					res.send({err: 'se5'});
			}
						
			function checkStore(err, store) {	
				if (!err && store) {				
					if (!hasMember(store, req.body.inviteName)) {					
						if (!store.waiting) 
						  store.waiting = [];
						  
						var m = {account: req.body.inviteName};
						store.waiting.push(m);

						var query = {owner : req.body.owner, storeName : req.body.storeName};
						var doc = {
							$set : {
								waiting: store.waiting,
								members: store.members						
						}};			
						
						dbUpdate(url, storesCollection, query, doc, res);
						var userName = global.getUserName(req.body.inviteName);
						res.send({doc: userName});
					} else
						res.send({err: 'se4'});
				} else
					res.send({err: 'se6'});
			}
		
		} else
		    res.send({err: 'se2'});
	} else
		res.send({err: 'se2'});
}

function updateStoreTime(req, res) {	
	if (req.body.owner && req.body.storeName) {
		if (req.body.owner == req.session.user.email) {
			var query = {owner : req.body.owner, storeName : req.body.storeName};
						
			var doc = {$set : {openTime : req.body.openTime}};
			dbUpdate(url, storesCollection, query, doc, res); 

		} else
			res.send({err: 'se2'});
	} else
		res.send({err: 'se2'});
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
				var index = getWaitingIndex(store, req.session.user.email);								
				if (index >= 0) {
					store.waiting.splice(index, 1);
					if (req.body.answer === 1) {
						var member = {account : req.session.user.email};
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
	
	dbfindOne(url, worksCollection, query, fields, function(err, work) {
		if (work) {
			setUserName(work);
			res.send({doc: work});
		}
		else
			res.send();
	});
}

function findWorks(req, res) {
	var query = {name : {$regex: req.body.name+'.*', $options: 'i'}};	
	var fields = {_id: 0, pw: 0};
	var sortParam = {name:1};
	dbfind(urlNiceMarket, usersCollection, query, fields, sortParam, res);
}

function hasMember(user, account) {	
	if (user.customs) {
		for (var i in user.customs) {
			if (user.customs[i].account === account) {
				return true;
			}
		}
	}

	if (user.waiting) {
		for (var i in user.waiting) {
			if (user.waiting[i].account === account) {
				return true;
			}
		}
	} 	
	
	if (user.works) {
		for (var i in user.works) {
			if (user.works[i].account === account) {
				return true;
			}
		}
	}		

	return false;
}

function getWaitingIndex(user, account) {		
	if (user && user.waiting) 
		for (var i in user.waiting) 
			if (user.waiting[i].account === account) 
				return i;

    return -1;
}

function updateJoinWork(req, res) {
	if (req.body.account) {
		var query = {account : req.body.account};
		var fields = {_id : 0};
		dbfindOne(url, worksCollection, query, fields, checkWork);

		function checkWork(err, work) {
			if (!err && work) {
				if (true) { //(work.account !== req.session.user.email) {
					if (!hasMember(work, req.session.user.email)) {
						if (!work.waiting)
							work.waiting = [];

						var member = {account : req.session.user.email};
						work.waiting.push(member);

						var customerQuery = {account : req.session.user.email};
						dbfindOne(url, customersCollection, customerQuery, fields, checkCustomer);

						function checkCustomer(err, customer) {
							if (!err && customer) {
								if (!hasMember(customer, req.body.account)) {								
									if (!customer.waiting)
										customer.waiting = [];

									var w = {account : req.body.account};
									customer.waiting.push(w);

									dbUpdate(url, worksCollection, query, work, res);
									dbUpdate(url, customersCollection, customerQuery, customer, res);
								} else
								    res.send({err: 'se8'});
							} else 
								res.send({err: 'se8'});						
						}

					} else
						res.send({err: 'se8'});
				} else
					res.send({err: 'se9'});
			} else
				res.send({err: 'se7'});
		}
	}
}

function updateAcceptJoinWork(req, res) {
	if (req.body.account && req.body.answer) {
		var query = {account : req.session.user.email};
		var fields = {_id : 0};
		dbfindOne(url, worksCollection, query, fields, checkWork);

		function checkWork(err, work) {
			if (!err && work) {
				var index = getWaitingIndex(work, req.body.account);
				if (index >= 0) {
					if (req.body.answer === 1) {
						var has = false;
						if (!work.customers)
							work.customers = [];
						else {
							for (var i in work.customers) {
								if (work.customers[i].account === req.body.account) {
									has = true;
									break;
								}
							}
						}

						if (has === false)
							work.customers.push(work.waiting[index]);
					}
					work.waiting.splice(index, 1);

					var newWork = {
						$set : {
							waiting : work.waiting,
							customers : work.customers
						}
					};

					var customerQuery = {account : req.body.account};
					dbfindOne(url, customersCollection, customerQuery, fields, checkCustomer);
					function checkCustomer(err, customer) {
						if (!err && customer) {
							dbUpdate(url, worksCollection, query, newWork, res);
							
							var index = getWaitingIndex(customer, req.session.user.email);
							if (index >= 0) {
								if (req.body.answer === 1) {
									var has = false;
									if (!customer.works)
										customer.works = [];
									else {
										for (var i in customer.works) {
											if (customer.works[i].account === req.session.user.email) {
												has = true;
												break;
											}
										}
									}
								}

								if (has === false)
									customer.works.push(customer.waiting[index]);
									
								customer.waiting.splice(index, 1);
								
								var newCustomer = {
									$set : {
										waiting : customer.waiting,
										works : customer.works
									}
								};

								dbUpdate(url, customersCollection, customerQuery, newCustomer, res);
							} else
								res.send({err: 'se8'});
						} else
							res.send({err: 'se7'});
					}
				} else
					res.send({err: 'se7'});
			} else
				res.send({err: 'se6'});
		}

	} else
		res.send({err: 'se2'});
}

function findMyCustomer(req, res) {
	var query = {account: req.session.user.email};	
	var fields = {_id: 0};
	dbfindOne(url, customersCollection, query, fields, function(err, customer){
		if (!err && customer) {
			setUserName(customer);			
			res.send({doc: customer});
		}	
		else
			res.send();
	});
}

function findAllStores(req, res) {
	var query = {};	
	var fields = {_id: 0, members: 0, waiting: 0};
	var s = {storeName: 1};
	dbfind(url, storesCollection, query, fields, s, res);
}
