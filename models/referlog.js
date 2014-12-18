/**
 * New node file
 */
 var database = require('./database');
 var db = database.createClient();
 var referlog = exports;
 
 // insert wordlog
 referlog.insert = function (_c, callback) {
	 
   db.query(
     'INSERT INTO logs '
       + '(contents, modified, created, status_flag) '
       + 'VALUES '
       + '(?, NOW(), NOW(), "1")'
       + ';',
     [_c], 
     function (err, results, fields) {
       db.end();
       //var sid = results.insertId;
       if (err) {
         callback(err);
         return;
       }
       callback(null);
     });
 };
 
 // select wordlog
 referlog.select = function (_k, callback) {
	console.log(_k);
   db.query(
     'SELECT l.contents, l.created, u.name '
	   + 'FROM logs AS l '
	   + 'INNER JOIN users AS u ' 
	   	+ 'ON l.user_id = u.id '
       + 'WHERE l.contents LIKE ? '
       + 'AND l.status_flag = "1" '
       + 'ORDER BY l.created ASC '
       + 'LIMIT 10'
       + ';',
     ['%' + _k + '%'], 
     function (err, results, fields) {
       db.end();
       //var sid = results.insertId;
       if (err) {
         callback(err);
         return;
       }
       callback(results);
     });
 };
 
//insert garbages
 referlog.insertgarbages = function (_c, callback) {
	 
   db.query(
     'INSERT INTO garbages '
       + '(type, contents, modified, created, status_flag) '
       + 'VALUES '
       + '("1", ?, NOW(), NOW(), "1")'
       + ';',
     [_c], 
     function (err, results, fields) {
       db.end();
       //var sid = results.insertId;
       if (err) {
         callback(err);
         return;
       }
       callback(null);
     });
 };
 
 // select wordlog
 referlog.selectScript = function (_u, _n, callback) {
   db.query(
     'SELECT * '
	   + 'FROM script '
       //+ 'WHERE id =  ? '
       + 'WHERE status_flag = "1" '
       + 'ORDER BY rectime '
       + 'DESC '
       + 'LIMIT 0,? '
       + ';',
     [_n],
     function (err, results, fields) {
       db.end();
       //var sid = results.insertId;
       if (err) {
       console.log(err);
         callback(err);
         return;
       }
       callback(results);
     });
 };


//insert script
 referlog.insertScript = function (_d, callback) {
   db.query(
     'INSERT INTO script '
       + '(rectime, script, scriptlen, action, keycount, tips,  modified, created, status_flag) '
       + 'VALUES '
       + '(?, ?, ?, ?, ?, "", NOW(), NOW(), "1")'
       + ';',
     [_d.rectime, _d.script, _d.scriptlen, _d.action, _d.keycount], 
     function (err, results) {
       db.end();
       //var sid = results.insertId;
       if (err) {
         callback(err);
         return;
       }
       callback(null, _d.rectime);
     });
 };

//insert tips data
 referlog.insertTips = function (_d, callback) {
   db.query(
     'UPDATE script SET '
       + 'tips = ? '
       + 'WHERE status_flag = "1" '
       + 'ORDER BY rectime '
       + 'DESC '
       + 'LIMIT 1 '
       + ';',
     [_d], 
     function (err, results) {
       db.end();
       //var sid = results.insertId;
       if (err) {
       	 console.dir(err);
         callback(err);
         return;
       }
       callback(null);
     });
 };

