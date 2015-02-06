var fs = require('fs');
fs.readFile('./state.csv', 'utf8', function (err, text) {

	var statelist = new Array();
	statelist = text.split("\n");

	console.log(statelist.length);

	var action_num = 9;
	var transition = new Array();
	for(var ti = 0 ; ti < action_num; ti++){
		transition[ti] = new Array();
		for(var tj = 0; tj < action_num; tj++){
			transition[ti][tj] = 0;
		}
	}		

	var lastaction = -1;

	for(var i = 0; i < statelist.length; i++){
		if(statelist[i] < action_num){
			if(lastaction != -1){
				transition[statelist[i]][lastaction]++;
			}
			lastaction = statelist[i];
		}
	}

	console.dir(transition);
	
	var total = new Array();
	for(var i = 0; i < transition.length; i++){
		total[i] = 0;

	for(var ii = 0; ii < transition[i].length; ii++){
		total[i] += transition[i][ii];
	}
	}
	console.dir(total);

	var ratio = new Array();
	for(var i = 0; i < transition.length; i++){
		ratio[i] = new Array();
	for(var ii = 0; ii < transition[i].length; ii++){
		if(total[i] != 0){
		ratio[i][ii] = Math.round(transition[i][ii]/total[i] * 100)/100 ;
		}else{
		ratio[i][ii] = 0;
		}
	}
	}
	console.dir(ratio);
	
});
