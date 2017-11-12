<?php 
error_reporting(3);
include('./db.php');


if (idLogin()) {
  echo $_COOKIE['username'].'has logined';
} else {
  echo
<<<login
  <a href="./login.php">去登陆</a>
login;
}
















echo '<br>';
echo '-----------header------------';
echo '<br><br><br>';
