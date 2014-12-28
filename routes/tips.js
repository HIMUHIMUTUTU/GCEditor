
/*
 * GET home page.
 */

exports.view = function(req, res){
	if(req.query.u){
		res.render('tips', { title: 'tips', user: req.query.u});
	}else{
		res.render('caution');
	}
};
