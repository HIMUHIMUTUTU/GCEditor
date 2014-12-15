
var common = {
	socket: null, lstorage: localStorage
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
	this.radioList  = document.getElementsByName("actionRadio");
	this.lineCounter = document.getElementById("lineCounter");
	this.wordCounter = document.getElementById("wordCounter");
	this.pageCounter = document.getElementById("pageCounter");
	this.keyCounter = document.getElementById("keyCounter");
	this.actionRadio = document.getElementById("actionRadio");
	this.lastUpdate = document.getElementById("lastUpdate");
	this.networkStatus = document.getElementById("networkStatus");

	this.timer = new Timer();
	this.looptime = 3 * 60 * 1000;

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

	//function for bottun click
	this.closeButton.onclick  = function(event) {self.close()};

	//main loop
	var loop = function(){
		console.log(self.status_flag);
		if(self.status_flag == "recording"){
			self.getScript();		
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

	console.log(navigator.onLine);
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
			console.dir(data);
			self.disableScript(data.value);
			//if main.status_flag is 0, close window
			if(self.status_flag == "close"){
				location.href = "/doclist";
				//	socket.emit('redirectRequest', {value: ""});
			}else{
				/** update updatetime  
				  var updatetime = this.timer.gettime;
				 **/
			}
		});
		common.socket.on('loadedScript', function(data) {
			console.dir(data);
			if(data.value.length != 0){
				console.log(data.value[0].script);
				//self.initialLength = data.value[0].script.length;
				tinyMCE.get('script').setContent(data.value[0].script);
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
		plugins: "print textcolor save wordcount",
		width : self.lineword + "em",
		content_css : "css/custom_content.css",
		fontsize_formats: "10pt 12pt 14pt 18pt 24pt 36pt",
		custom_shortcuts : false,
		statusbar : false,
		height : "36em",
		menubar : false, 
		toolbar: [
			"undo redo | bold italic underline strikethrough | alignleft aligncenter alignright | forecolor | fontsizeselect"
		],
		setup : function(editor) {
			editor.on('init', function (e) {
				//load current data
				if(self.network == "online"){
					self.loadRemoteScript();
				}else if(self.network == "offline"){
					self.loadLocalScript();
				}
			});
			editor.on('change', function (e) {  

				var htmltext = "";
				var text = "";
				htmltext = editor.getContent();
				text = removeHTML(htmltext);

				//wordcount
				self.wordcount = countWord(text);
				self.wordCounter.innerHTML= self.wordcount; 

				//linecount
				var nl = countLine(text, self.lineword);
				//	tinyMCE.get('script').setContent(lineBreak(htmltext,self.lineword));
				if(self.linecount == 0){
					self.linecount = nl;
				}
				if(self.linecount != nl){
					//remake page break
					tinyMCE.get('script').setContent(pageBreak(htmltext,self.pageline));
					self.linecount = nl;
				}
				self.lineCounter.innerHTML= self.linecount;

				//pagecount
				self.pagecount = Math.floor((self.linecount - 1)/self.pageline) + 1;
				self.pageCounter.innerHTML= self.pagecount; 

			});
			editor.on('keyup', function (e) {  
				self.keycount++;
				self.monar = makeMonar(self.keycount);
				self.keyCounter.innerHTML= self.monar;
			});

		}
	});
}

MAIN.prototype.loadRemoteScript = function(){
	common.socket.emit('loadRequest', {value: ""});
}

MAIN.prototype.loadLocalScript = function(){
	console.log(common.lstorage.getItem("current"));	
	if(common.lstorage.getItem("current")){
		var lcontent = common.lstorage.getItem("current");
		lcontent = JSON.parse(lcontent);
		tinyMCE.get('script').setContent(lcontent.script);
	}
	self.status_flag = "recording";
}

/** get script **/
MAIN.prototype.getScript = function(){
	//get script contents
	this.log[this.ln] = new Recorder();
	this.log[this.ln].script = tinyMCE.get('script').getContent();
	this.log[this.ln].scriptlen = this.wordcount; 
	this.log[this.ln].rectime = this.timer.gettime();
	for(var i=0; i<this.radioList.length; i++){
		if (this.radioList[i].checked) {
			this.log[this.ln].action = this.radioList[i].value;
			break;
		}
	}

	/**caluculate velocity
	  if(this.ln == 0){
	  console.log(this.log[this.ln].script);
	  console.log(this.initialLength);
	  this.log[this.ln].velocity = this.log[this.ln].script.length - this.initialLength; 
	  }else{
	  this.log[this.ln].velocity = this.log[this.ln].script.length - this.log[this.ln - 1].script.length;
	  };
	 **/
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
			location.href = "/doclist";
		}
	}
}

/** Recorder Object **/
function Recorder(){
	this.script;
	this.scriptlen;
	this.rectime;
	this.action;
	this.keycount;
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

function pageBreak(_w, _p){
	var ow = new Array();
	var iw = _w.split("\n");
	var linenum = 0;
	for(var i=0; i<iw.length; i++){
		if(!iw[i].match(/<p\sclass="break">([^<]+)<\/p>/g)){

			if(linenum%_p == 0 && linenum != 0){
				ow.push("<p class='break'> ----- page" + linenum/_p  + " ----- </p>");
			}	
			ow.push(iw[i]);
			linenum++;


		}
	}
	ow = ow.join("\n");
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
