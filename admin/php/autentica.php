<?php
require_once('aes.php');
require_once('aesctr.php');
$params = json_decode(file_get_contents('php://input'),true);
$usuario = $params['usuario'];
$clave = $params['clave'];
$titulo = $params['titulo'];
$user = "iwKj2+gHTleo61cIUg==";
$password = "igIvzugHTlfcQukaTiQ=";
$realUser = AesCtr::decrypt($user, $titulo, 256);
$realPass = AesCtr::decrypt($password, $titulo, 256);
$nombre = "Administrador";
if ($usuario == $realUser && $clave == $realPass) {
    echo json_encode(array('autenticado' => true, 'nombre'=> $nombre, 'respuesta' => true));
} else {
    echo json_encode(array('autenticado' => false, 'respuesta' => true));
}

?>