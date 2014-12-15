
/*
 * GET home page.
 */

var referlog = require('../models/referlog');

exports.view = function(req, res){
	referlog.selectScript("", 9999, function(script_data){
		console.dir(script_data);
		for(var i = 0; i < script_data.length; i++){
			script_data[i].script = removeHTML(script_data[i].script);
			script_data[i].rectime = Math.floor((script_data[i].rectime - script_data[script_data.length - 1].rectime)/1000);
		}
		res.render('analysis', { title: 'analysis', script: script_data });
	});
};

function removeHTML(_w){
	var rw = _w.replace(/<p\sclass="break">([^<]+)<\/p>\n/g,"");
	var rw = rw.replace(/(<([^>]+)>)/ig,"").replace(/&nbsp;/g,"");
	//	var rw = _w.replace(/(<([^>]+)>)/ig,"");
	return rw;
}

