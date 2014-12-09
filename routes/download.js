
/*
 * GET home page.
 */

var referlog = require('./models/referlog');

exports.view = function(req, res){
	res.render('download', { title: 'download' });
};

referlog.selectScript(data.value, function(script_data){
	console.dir(script_data);

}
