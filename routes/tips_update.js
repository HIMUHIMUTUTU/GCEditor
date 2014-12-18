
/*
 * GET home page.
 */

var referlog = require('../models/referlog');

exports.view = function(req, res){

	var tips = "(1)" + req.param('resource') + 
		"(2)" + req.param('goal') + 
		"(3)" + req.param('interaction');
	console.dir(tips);
	referlog.insertTips(tips, function(callback){
		res.redirect('/doclist');
	});
};

