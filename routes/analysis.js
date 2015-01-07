
/*
 * GET home page.
 */

var referlog = require('../models/referlog');

exports.view = function(req, res){
	if(req.query.u){
		referlog.selectScript(req.query.u, 9999, function(script_data){
			console.dir(script_data);
			var action_num = 9;
			var transition = new Array();
			for(var ti = 0 ; ti < action_num; ti++){
				transition[ti] = new Array();
				for(var tj = 0; tj < action_num; tj++){
					transition[ti][tj] = 0;
				}
			}		
			var lastaction = -1;
			for(var i = 0; i < script_data.length; i++){
				script_data[i].script = removeHTML(script_data[i].script);
				script_data[i].recclock = new Date(script_data[i].rectime); 
				script_data[i].rectime = Math.floor((script_data[i].rectime - script_data[script_data.length - 1].rectime)/1000);
				if(script_data[i].action < action_num){
					if(lastaction != -1){
						transition[script_data[i].action][lastaction]++;
					}
					lastaction = script_data[i].action;
				}
			}
			res.render('analysis', { title: 'analysis', script: script_data, transition: transition });
		});
	}else{
		res.render('caution');
	}
};

function removeHTML(_w){
	var rw = _w.replace(/<p\sclass="break">([^<]+)<\/p>\n/g,"");
	var rw = rw.replace(/(<([^>]+)>)/ig,"").replace(/&nbsp;/g,"");
	//	var rw = _w.replace(/(<([^>]+)>)/ig,"");
	return rw;
}

