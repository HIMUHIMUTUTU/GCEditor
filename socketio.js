/**
 * New node file
 */
var routes = require('./routes');
var referlog = require('./models/referlog');
//var handwrite_recognition = require('./models/handwrite_recognition');
var app = module.parent.exports;
var io = app.get('io');
var client = {agent:{}, garbage:{}, editor:{}};

//case of receive connection of client 
io.sockets.on('connection', function(socket) {

	//authentication and ID management
	socket.on('auth', function(data){
		client[data.type][socket.id] = socket;
		console.dir(client);

	}); 

	/** receive database Request **/
	socket.on('loadRequest', function(data){
		referlog.selectScript(data.value, 1, function(script_data){
			//send it to editor
			for (key in client['editor']){
				var csocket = client['editor'][key]
					csocket.emit('loadedScript', { value: script_data });
			}
		});
	});

	/** Register garbages **/
	socket.on('sentScript', function(data) {
		console.log("SERVER:RECIVE SENT SCRIPT:");
		console.dir(data.value);

		referlog.insertScript(data.value, function(err, data){
			if(err){
				console.log(err);
			}else{
				console.log("SERVER:SAVE COMPLETE");
				for (key in client['editor']){
					var csocket = client['editor'][key]
						csocket.emit('savedScriptId', { value: data });
				}
			}
		});
	});

	/** クライアントが切断したときの処理 **/
	socket.on('disconnect', function(){
		console.log("disconnect");
	});
});



