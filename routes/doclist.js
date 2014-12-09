
/*
 * GET home page.
 */

exports.view = function(req, res){
  res.render('doclist', { title: 'List of Documents' });
};
