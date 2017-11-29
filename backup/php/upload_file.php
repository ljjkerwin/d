<?php
echo '<pre>';

var_dump($_POST);
var_dump($_FILES);

move_uploaded_file($_FILES['file']['tmp_name'], "./uploads/{$_FILES['file']['name']}");