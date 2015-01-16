
/*
 * GET home page.
 */

var referlog = require('../models/referlog');

exports.view = function(req, res){
	if(req.query.u && req.query.n){
		referlog.selectScript(req.query.u, req.query.n, function(script_data){
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
				script_data[i].script = script_data[i].script;
				if(i != script_data.length - 1){
				script_data[i].add = compareScript(script_data[i+1].script, script_data[i].script);
				script_data[i].remove = compareScript(script_data[i].script, script_data[i+1].script);
				}else{
				script_data[i].add = script_data[i].script;
				script_data[i].remove = ""; 
				}
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

function compareScript(_b, _a){
_a = _a.split("\n");
_b = _b.split("\n");
var diff = new Array();
		for(var ai = 0; ai < _a.length; ai++){
		var dup = 0;
	for(var bi = 0; bi < _b.length; bi++){
			if(_a[ai] == _b[bi]){
			dup++;
			}
		}
		if(dup == 0){
			diff.push(ai + "line:" + _a[ai])
		}
	}
	return diff;
}
