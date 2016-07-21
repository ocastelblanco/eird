<?php
require_once('variables.php');
require_once('medoo.php');
// Esto permite des-serializar los parámetros POST que vienen en forma JSON
$params = json_decode(file_get_contents('php://input'),true);
// ---------> Solución temporal mientras se implementa MySQL
$nombre_cat = 'categorias.json';
$nombre_pc = 'palabrasclave.json';
// ---------> Fin solución temporal
$salida = array();
if ($params["categorias"] && $params["palabrasclave"]) {
    // Acá se debe reemplazar por una acción de cargar, actualizar o eliminar info a MySQL, a partir de $categorias y $palabras
    file_put_contents($nombre_cat, json_encode($params["categorias"], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT));
    file_put_contents($nombre_pc, json_encode($params["palabrasclave"], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT));
    // --
    $salida["respuesta"] = true;
    $salida["categorias"] = $params["categorias"];
    $salida["palabrasclave"] = $params["palabrasclave"];
}
echo json_encode($salida, JSON_UNESCAPED_UNICODE);
?>