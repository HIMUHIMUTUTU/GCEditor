var summary = {action:[['action'],['1', 0],['2', 0],['3', 0],['4', 0],['5', 0],['6', 0]], word:[['id'],['速度(打鍵数)'],['文章文字数']], transition:[[[]]], totalaction:[]}; 
for(var ti = 0; ti < 7; ti++){
	for(var tii = 0; tii < 7; tii++){
//summary.transition[ti][tii][0] = 0;
	}
}

var lastaction;
for(var i = script_s.length  - 1;  i >= 0; i--){
	for(var ai = 1; ai < 7; ai++){
		if(script_s[i].action == ai){summary.action[ai][1]++;}
		
	}
		summary.word[0].push(script_s[i].id);
		summary.word[1].push(script_s[i].keycount);
		summary.word[2].push(script_s[i].scriptlen);
//		transition[lastaction][script_s[i].action][0]++;
		lastaction = script_s[i].action;
}

	for(var ati = 1; ati < 7; ati++){
		
		
	}
console.dir(summary);
var chartdata79 = {
	"config": {
		"title": "アクション割合",
		"subTitle": "",
		"type": "pie",
		"percentVal": "yes",
		"useVal": "yes",
		"pieDataIndex": 0,
		"colNameFont": "100 18px 'Arial'",
		"pieRingWidth": 80,
		"pieHoleRadius": 40,
//		"textColor": "#888",
		"bg": "#fff",
			"useShadow" : "no"
	},

	"data":summary.action 
};

ccchart.init('hoge', chartdata79);


var chartdata2 = {

	"config": {
		"title": "文字数/操作数",
		//"subTitle": "Canvasを使ったシンプルなラインチャートです",
		"type": "line",
		"lineWidth": 4,
		"colorSet": 
			["red","#FF9114"],
		"bg": "#fff",
			"useShadow" : "no"
	},

	"data":summary.word
};
ccchart.init('hoge2', chartdata2)
