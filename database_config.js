var mysql = require('mysql');
var config = require("./config");
var pool = mysql.createPool({
    host: "localhost",
    user: "root",
    password: config.DB_PASS,
    database: "escproject",
    connectionLimit: 50
  });
var con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: config.DB_PASS,
    database: "escproject"
  });

module.exports = {pool, con, mysql}