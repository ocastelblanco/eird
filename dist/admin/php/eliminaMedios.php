<?php
require_once('variables.php');
require_once('medoo.php');
date_default_timezone_set($timezone);
// Esto permite des-serializar los parámetros POST que vienen en forma JSON
$params = json_decode(file_get_contents('php://input'),true);
// ---------> Solución temporal mientras se implementa MySQL
$nombre_fichero = 'entradas.json';
$gestor = fopen($nombre_fichero, 'r+');
$contenido = fread($gestor, filesize($nombre_fichero));
fclose($gestor);
// ---------> Fin solución temporal
chdir($rutaMedios);
$entradas = json_decode($contenido, true);
$salida = array();
if ($params["accion"] == "eliminar" && $params["id"]) {
    foreach($entradas as $clave => $valor) {
        if ($valor["id"] == $params["id"]) {
            $nombreMedio = $valor["medios"][$params["medio"]]["ruta"];
            $nombreThumb = $valor["medios"][$params["medio"]]["thumb"];
            //echo "Eliminando $nombreMedio<br>";
            unlink($nombreMedio);
            if ($nombreThumb) {
                //echo "Eliminando $nombreThumb<br>";
                unlink($nombreThumb);
            }
            array_splice($valor["medios"], $params["medio"], 1);
            $entradas[$clave] = $valor;
        }
    }
    // Acá se debe reemplazar por una acción de cargar, actualizar o eliminar info a MySQL, a partir de $entradas
    chdir($rutaPHP);
    file_put_contents($nombre_fichero, json_encode($entradas, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT));
    // --
    $salida["respuesta"] = true;
} else {
    $salida["respuesta"] = false;
    $salida["mensaje"] = "No se pudo realizar la acción. Intente de nuevo más adelante.";
}
echo json_encode($salida);
?>