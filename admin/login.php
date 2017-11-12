<?php

include('./db.php');

if (isLogin($_GET['username'])) {
  header("Location: /admin/index.php");
  setcookie("username", "root", time() + 60 * 5);
}


?>


<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="ie=edge">
  <title>Document</title>
</head>
<body>

<form action="/admin/login.php" method="get">
  <div>
    <span>username:</span>
    <input type="text" name="username">
  </div>
  <div>
    <span>password:</span>
    <input type="password" name="password">
  </div>
  <input type="submit" value="submit">
</form>

</body>
</html>