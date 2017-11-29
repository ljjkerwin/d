<?php
include('./db.php');
header("Content-Type: text/html;charset=utf-8");

if (isLogin()) {
  echo
<<<hasLogin
  {$_COOKIE['username']} 已登录
  <button onclick="document.cookie='username=;expires='+new Date(0);location.reload()">退出登录</button>
hasLogin;
} else {
  echo "<a href='./login.php'>去登录</a>";
}
