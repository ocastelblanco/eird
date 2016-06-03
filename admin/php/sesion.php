<?php
require_once('medoo.php');
$accion = $_GET['accion'];
session_start();
if ($accion == 'comprobar') {
    echo json_encode(array('id' => $_SESSION['sesionID'], 'conexion' => true));
    //echo json_encode(array('id' => 'pepe', 'conexion' => true));
}
if ($accion == 'datos') {
    //echo json_encode(array('nombre' => 'Pepe Perez', 'conexion' => true));
    echo json_encode(array('nombre' => $_SESSION['nombre'], 'conexion' => true));
}
if ($accion == 'crear') {
    $sesionID = $_GET['sesionID'];
    $_SESSION['sesionID'] = $sesionID;
    $_SESSION['nombre'] = $_GET['nombre'];
    echo json_encode(array('conexion' => true, 'sesionID' => $sesionID));
}
if ($accion == 'cerrar') {
    unset($_SESSION['sesionID']);
    unset($_SESSION['nombre']);
    echo json_encode(array('conexion' => true));
}
?>