
/*
 * GET home page.
 */

var referlog = require('../models/referlog');

exports.view = function(req, res){

	var a = req.param('resource');
	referlog.insertTips(a, function(callback){
		res.redirect('/doclist');
	});
};

