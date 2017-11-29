<?php



$db = mysql_connect("localhost", "root", "root");

$res = mysql_query("SELECT * FROM information_schema.SCHEMATA where SCHEMA_NAME='admin'");

if (mysql_num_rows($res) !== 1) {
  $res = mysql_query("CREATE DATABASE admin");
}
$res = mysql_select_db('admin');


$res = mysql_query("CREATE TABLE IF NOT EXISTS user (
  id int(10) NOT NULL AUTO_INCREMENT PRIMARY KEY,
  username char(20) NOT NULL,
  password char(20) NOT NULL,
  last_login int
)");


$res = mysql_query("SELECT * FROM user WHERE username='root'");
if (!$res) {
  mysql_query("INSERT INTO user (username, password) values ('root', 'root')");
}




function isLogin($username) {
  if (empty($username)) {
    $username = $_COOKIE["username"];
  }

  $res = mysql_query("SELECT * FROM user WHERE username='$username'");
  // var_dump($res);
  return mysql_num_rows($res) ? true : false;
}