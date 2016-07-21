<?php
require_once('variables.php');
require_once('medoo.php');
// Esto permite des-serializar los parámetros POST que vienen en forma JSON
$params = json_decode(file_get_contents('php://input'),true);
// ---------> Solución temporal mientras se implementa MySQL
$nombre_cat = 'categorias.json';
$nombre_pc = 'palabrasclave.json';
$gestor = fopen($nombre_cat, 'r+');
$contenido = fread($gestor, filesize($nombre_cat));
$categorias = json_decode($contenido, true);
$gestor = fopen($nombre_pc, 'r+');
$contenido = fread($gestor, filesize($nombre_pc));
$palabras = json_decode($contenido, true);
fclose($gestor);
// ---------> Fin solución temporal
$salida = array();
if ($params["accion"] == "eliminar" && $params["categoria"]) {
    $index = 0;
    foreach($categorias as $llave => $valor) {
        if ($params["categoria"] == $llave){
            array_splice($categorias, $index, 1);
        }
        $index++;
    }
    $index = 0;
    foreach($palabras as $llave => $valor) {
        if ($params["categoria"] == $llave){
            array_splice($palabras, $index, 1);
        }
        $index++;
    }
    // Acá se debe reemplazar por una acción de cargar, actualizar o eliminar info a MySQL, a partir de $categorias y $palabras
    file_put_contents($nombre_cat, json_encode($categorias, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT));
    file_put_contents($nombre_pc, json_encode($palabras, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT));
    // --
    $salida["respuesta"] = true;
}
echo json_encode($salida, JSON_UNESCAPED_UNICODE);
?>