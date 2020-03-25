var mysql = require('mysql');
var pool = mysql.createPool({
    host: "localhost",
    user: "root",
    password: "QAWSedrf@2",
    database: "escproject",
    connectionLimit: 50
  });
var con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "QAWSedrf@2",
    database: "escproject"
  });

  /* con.connect(function(err) {
    if (err) throw err;
    console.log("Connected!");
    con.query("DELETE FROM iphone_queues WHERE CustomerId = 'cust3'", function (err, result) {
      if (err) throw err;
      console.log("deleted");
    });
  }); */
module.exports = {pool, con, mysql}