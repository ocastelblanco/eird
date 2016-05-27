<?php
require_once('medoo.php');
$accion = $_GET['accion'];
session_start();
if ($accion == 'comprobar') {
    echo json_encode(array('id' => $_SESSION['sesionID'], 'conexion' => true));
    //echo json_encode(array('id' => 'pepe', 'conexion' => true));
}
if ($accion == 'datos') {
    echo json_encode(array('nombre' => 'Pepe Perez', 'conexion' => true));
}
?>