
/*
 * GET home page.
 */

var referlog = require('../models/referlog');

exports.view = function(req, res){
	if(req.query.u){
	}else{
		console.log("no user");
	}
	referlog.selectScript("", 1, function(script_data){
		console.dir(script_data);
		var script = createText(script_data[0].script);
		res.statusCode = 200;
		res.setHeader('Content-disposition', 'attachment; filename=hoge.txt');
		res.setHeader('Content-Type', 'text/plain');
		res.send(script);
		res.end;
	});
};

function createText(_w){
	var rw = _w.replace(/<p\sclass="break">([^<]+)<\/p>\n/g,"");
	var rw = rw.replace(/(<([^>]+)>)/ig,"").replace(/&nbsp;/g,"").replace(/\n/g,"\r\n");
	//	var rw = _w.replace(/(<([^>]+)>)/ig,"");
	return rw;
}
