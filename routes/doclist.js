
/*
 * GET home page.
 */

exports.view = function(req, res){
	if(req.query.u){
		res.render('doclist', { title: 'documents', user: req.query.u });
	}else{
		res.render('caution');
	}

};
