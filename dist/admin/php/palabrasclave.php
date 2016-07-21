<?php
require_once('medoo.php');
$params = $_GET;

// ---------> Solución temporal mientras se implementa MySQL
$nombre_fichero = 'palabrasclave.json';
$gestor = fopen($nombre_fichero, 'r+');
$contenido = fread($gestor, filesize($nombre_fichero));
fclose($gestor);
// ---------> Fin solución temporal

$cadena = json_decode($contenido, true);
$salida = [];
if (!$params["guardar"]) {// Si no se solicita guardar, solamente se entregan las subcategorías de una categoría solicitada
    $num = array_keys($cadena);
    $salida = $cadena[$num[$params["cat"]]];
}
if ($params["todo"]) {
    $salida = $cadena;
}
echo json_encode($salida, JSON_UNESCAPED_UNICODE);// | JSON_PRETTY_PRINT);
?>