
var common = {
	socket: null, lstorage: localStorage, user: guser
};

/** socket action **/
var clientinfo = {
	type: 'editor'
};

/** MAIN Object **/
window.onload = function() {
	var main = new MAIN();
};

function MAIN(){
	this.closeButton = document.getElementById('closeButton');
	this.radioList = document.getElementById("radioList");
	this.radioTitle = document.getElementById("radioTitle");
	this.actionRadio = document.getElementsByName("actionRadio");
	this.lineCounter = document.getElementById("lineCounter");
	this.wordCounter = document.getElementById("wordCounter");
	this.pageCounter = document.getElementById("pageCounter");
	this.keyCounter = document.getElementById("keyCounter");
	this.lastUpdate = document.getElementById("lastUpdate");
	this.networkStatus = document.getElementById("networkStatus");

	this.timer = new Timer();
	this.looptime = 1 * 60 * 1000;
	this.answertime = 1 * 30 * 1000;

	this.pageline = 40; //40 word 40 line
	this.lineword = 40; //40 word 40 line

	this.linecount = 0;
	this.wordcount = 0;
	this.pagecount = 0;
	this.keycount = 0;
	this.monar = "";
	this.actionradio = 0;
	this.network = "offline";

	//this.initialLength = 0; 
	this.log = new Array();
	this.ln = 0;
	this.status_flag = "prepare";
	var self = this;

	this.prepareList();

	//function for bottun click
	this.closeButton.onclick  = function(event) {self.close()};

	//main loop
	var loop = function(){
		console.log(self.status_flag);
		if(self.status_flag == "recording"){
			self.getScript();		
			self.prepareList();
			if(self.network == "online"){
				self.clearLocalScript();
				self.sendScript();
			}else if(self.network == "offline"){
				self.saveScript();
			}
			console.log(self.log);
		}
		setTimeout(loop, self.looptime);
	}
	loop();

	/** socket.io function **/
	if (navigator.onLine == true) {
		console.log(navigator.onLine);
		common.socket = io.connect();

		common.socket.on('connect', function(msg) {
			self.network= "online";
			self.networkStatus.innerHTML= "<font color = 'blue'>接続中</font>"; 
			self.initiateEditor();
			//authentication
			common.socket.emit('auth', clientinfo);
		});

		//receive record success notification from server
		common.socket.on('savedScriptId', function(data) {
			self.disableScript(data.value);
			self.lastUpdate.innerHTML= self.timer.getCal();
			//if main.status_flag is 0, close window
			if(self.status_flag == "close"){
				location.href = "/tips?u=" + common.user;
			}
		});

		common.socket.on('loadedScript', function(data) {
			console.dir(data);
			if(data.value.length != 0){
				console.log(data.value[0].script);
				//self.initialLength = data.value[0].script.length;
				tinyMCE.get('script').setContent(data.value[0].script);
				self.lastUpdate.innerHTML= self.timer.getCal();
				//count content		
				self.countContent();
			}
			self.status_flag = "recording";
		});
		common.socket.on('disconnect', function(data) {
			self.network= "offline";
			self.networkStatus.innerHTML= "<font color='red'>接続なし (データは一時的にPCに保存されますが、オンライン利用をおすすめします)</font>"; 
		});
		//if offline
	}else{
		this.initiateEditor();
	}
}

/** initialte tinymce editor **/
MAIN.prototype.initiateEditor = function(){	
	var self = this;
	tinymce.init({
		selector: "textarea",
		plugins: "print textcolor save wordcount paste",
		width : self.lineword + "em",
		content_css : "css/custom_content.css",
		fontsize_formats: "10pt 12pt 14pt 18pt 24pt 36pt",
		custom_shortcuts : false,
		paste_as_text: true,
		statusbar : false,
		height : "36em",
		menubar : false, 
		toolbar: [
			"undo redo | bold italic underline strikethrough | alignleft aligncenter alignright | forecolor"
		],
		setup : function(editor) {
			editor.on('init', function (e) {
				//modify css
				//var body = editor.getBody();
				//editor.dom.setStyle(body, "backgroundImage", "url(/img/config/background.png)");
				//editor.dom.setStyle(body, "background-size", "100% 36em");

				//load current data
				if(self.network == "online"){
					self.loadRemoteScript();
				}else if(self.network == "offline"){
					self.loadLocalScript();
				}

			});
			editor.on('change', function (e) {  
				//count content		
				self.countContent();
			});
			editor.on('keyup', function (e) {  
				self.keycount++;
				//self.monar = makeMonar(self.keycount);
				//self.keyCounter.innerHTML= self.monar;
			});

		}
	});
}

MAIN.prototype.loadRemoteScript = function(){
	common.socket.emit('loadRequest', {value: common.user});
}

MAIN.prototype.loadLocalScript = function(){
	console.log(common.lstorage.getItem("current"));	
	if(common.lstorage.getItem("current")){
		var lcontent = common.lstorage.getItem("current");
		lcontent = JSON.parse(lcontent);
		tinyMCE.get('script').setContent(lcontent.script);
		//count content		
		this.countContent();
	}
	this.status_flag = "recording";
}

/** get script **/
MAIN.prototype.getScript = function(){
	//get script contents
	this.log[this.ln] = new Recorder();
	this.log[this.ln].script = tinyMCE.get('script').getContent();
	this.log[this.ln].scriptlen = this.wordcount; 
	this.log[this.ln].rectime = this.timer.gettime();
	for(var i=0; i<this.actionRadio.length; i++){
		if (this.actionRadio[i].checked) {
			this.log[this.ln].action = this.actionRadio[i].value;
			this.actionRadio[i].checked = false;
			break;
		}
	}
	this.log[this.ln].keycount = this.keycount;
	this.keycount = 0;
	this.ln++;
}

MAIN.prototype.clearLocalScript = function(){
	for(var i = 0; i < common.lstorage.length; i++){
		var lcontent = new Array();
		if(common.lstorage.key(i).match(/^[0-9]{13}$/)){
			lcontent[i] = common.lstorage.getItem(common.lstorage.key(i));
			lcontent[i] = JSON.parse(lcontent[i]);

			this.log[this.ln] = new Recorder();
			this.log[this.ln].script = lcontent[i].script; 
			this.log[this.ln].scriptlen = lcontent[i].scriptlen;
			this.log[this.ln].rectime = lcontent[i].rectime;
			this.log[this.ln].action = lcontent[i].action;
			this.log[this.ln].keycount = lcontent[i].keycount;
			this.log[this.ln].status_flag = lcontent[i].status_flag;
			common.lstorage.removeItem(common.lstorage.key(i));
			this.ln++;
		}
	}
}


/** save script **/
MAIN.prototype.saveScript = function(){
	var ci = 0;
	for(var i=0; i<this.log.length; i++){
		if(this.log[i].status_flag == 1){
			common.lstorage.setItem(this.log[i].rectime, JSON.stringify(this.log[i]));
			if(this.log[i].rectime > ci){
				common.lstorage.setItem('current', JSON.stringify(this.log[i]));
				ci = this.log[i].rectime;
			}
			this.log[i].status_flag = 2;
		}
	}
}

/** send script **/
MAIN.prototype.sendScript = function(){
	var ci = 0;
	for(var i=0; i<this.log.length; i++){
		if(this.log[i].status_flag == 1){
			common.socket.emit('sentScript', {value: this.log[i]});
			if(this.log[i].rectime > ci){
				common.lstorage.setItem('current', JSON.stringify(this.log[i]));
				ci = this.log[i].rectime;
			}
		}
	}
}

/** disable previous script **/
MAIN.prototype.disableScript = function(_d){
	for(var i = 0; i < this.log.length; i++){
		if(this.log[i].rectime == _d){
			this.log[i].status_flag = 3;
		}
	}
}


/** save and close window **/
MAIN.prototype.close = function(){
	console.log(tinyMCE.get('script'));
	if(window.confirm('内容を保存して終了します')){
		this.status_flag = "close";
		this.getScript();		
		if(this.network == "online"){
			this.clearLocalScript();
			this.sendScript();
		}else if(this.network == "offline"){
			this.getScript();
			this.saveScript();
			location.href = "/tips?u=" + common.user;
		}
	}
}

/** count each number of scrit and set it to counter **/
MAIN.prototype.countContent = function(){
	var text = "";
	text = removeHTML(tinyMCE.get('script').getContent());
	
	//wordcount
	this.wordcount = countWord(text);
	this.wordCounter.innerHTML= this.wordcount; 

	//linecount
	this.linecount = countLine(text, this.lineword);
	this.lineCounter.innerHTML= this.linecount;

	//pagecount
	this.pagecount = Math.floor((this.linecount - 1)/this.pageline) + 1;
	this.pageCounter.innerHTML= this.pagecount; 
}

MAIN.prototype.prepareList = function(){
	this.radioList.style.visibility = "hidden";
	var self = this;
	setTimeout(function(){
		self.radioTitle.innerHTML= "<font color='#ff0000'>この" + self.looptime/(60 * 1000) + "分の活動を振り返り、最も注力したと思うものにチェックをしてください。</font>";
		self.radioList.style.visibility = "visible";
		document.getElementById('popList').play();
	}, (this.looptime - this.answertime));
}

/** Recorder Object **/
function Recorder(){
	this.script;
	this.scriptlen;
	this.rectime;
	this.action = 0;
	this.keycount;
	this.user = common.user;
	this.status_flag = 1;
}

/** Timer Object **/
function Timer(){
	var date = new Date();
	this.starttime = date.getTime();
}

Timer.prototype.gettime = function(){
	var date =new Date();
	var currenttime = date.getTime();
	return currenttime;
};

Timer.prototype.getCal = function(){
	var now =new Date();
	var year = now.getYear(); // 年
	var month = now.getMonth() + 1; // 月
	var day = now.getDate(); // 日
	var hour = now.getHours(); // 時
	var min = now.getMinutes(); // 分
	var sec = now.getSeconds(); // 秒
	if(year < 2000) { year += 1900; }
	if(month < 10) { month = "0" + month; }
	if(day < 10) { day = "0" + day; }
	if(hour < 10) { hour = "0" + hour; }
	if(min < 10) { min = "0" + min; }
	if(sec < 10) { sec = "0" + sec; }
	var cal = year + "/" + month + "/" + day + " " + hour + ":" + min + ":" + sec;
	return cal;
}

function removeHTML(_w){
	var rw = _w.replace(/<p\sclass="break">([^<]+)<\/p>\n/g,"");
	var rw = rw.replace(/(<([^>]+)>)/ig,"").replace(/&nbsp;/g,"");
	//	var rw = _w.replace(/(<([^>]+)>)/ig,"");
	return rw;
}

function countLine(_w, _lw){ 
	var l = _w.split("\n");
	var cl = 0;
	for(var li = 0; li < l.length; li++){
		cl = cl + Math.floor(charCount(l[li])/(2 *_lw));
		cl++;
	}
	return cl;
}

function countWord(_w){
	_w = _w.replace(/\n/g, "");
	var cw = _w.length;
	return cw;
}

function pageBreak(_w, _p, _lw){
	var ow = new Array();
	var iw = _w.split("\n");
	var linenum = 0;
	for(var i=0; i<iw.length; i++){
		if(!iw[i].match(/<p\sclass="break">([^<]+)<\/p>/g)){
		//if(!iw[i].match(/<hr\s\/>/g)){
			ow.push(iw[i]);
			linenum = linenum + Math.floor(charCount(removeHTML(iw[i]))/(2 *_lw));
			linenum++;
			console.log(linenum);
				while(linenum >= _p){ 
					ow.push("<p class='break'> ----- page" + linenum  + " ----- </p>");
					linenum = linenum - _p;
				}
		}	
	}
	ow = ow.join("\n");
	console.log(ow);
	return ow;
}

function makeMonar(_k){
	var m = "";
	if(_k < 30){
		m = "(´д｀)";
	}else if(_k >= 30 && _k < 100){
		m = "（ ﾟωﾟ ）";
	}else if(_k >= 100 && _k < 200){
		m = "(・∀・)ｲｲ!!";
	}else if(_k >= 200){
		m = " ((((；ﾟДﾟ))))";
	}
	if(_k%2 == 0){
		m = "&nbsp;" + m;
	}
	return m;
}

var charCount = function (str) {
	len = 0;
	str = escape(str);
	for (i=0;i<str.length;i++,len++) {
		if (str.charAt(i) == "%") {
			if (str.charAt(++i) == "u") {
				i += 3;
				len++;
			}
			i++;
		}
	}
	return len;
}
