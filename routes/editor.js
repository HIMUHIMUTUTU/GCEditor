
/*
 * GET home page.
 */

exports.view= function(req, res){
	if(req.query.u){
		res.render('editor', { title: 'Editor', user: req.query.u});
	}else{
		res.render('caution');
	}
};
