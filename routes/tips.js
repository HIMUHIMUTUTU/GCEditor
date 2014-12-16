
/*
 * GET home page.
 */

exports.view = function(req, res){
		res.reder('tips', { title: 'tips'});
};
