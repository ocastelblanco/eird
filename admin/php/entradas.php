<?php
require_once('medoo.php');
// Esto permite des-serializar los parámetros POST que vienen en forma JSON
$params = json_decode(file_get_contents('php://input'),true);
// ---------> Solución temporal mientras se implementa MySQL
$nombre_fichero = 'entradas.json';
$gestor = fopen($nombre_fichero, 'r+');
$contenido = fread($gestor, filesize($nombre_fichero));
fclose($gestor);
// ---------> Fin solución temporal
// Si no se envían parámetros POST, se responde con un listado de entradas en JSON
if (count($params) == 0) {
    echo $contenido;
} else { // Si la solicitud viene con parámetros, se debe o crear un nuevo ID o guardar en el enviado
    $posicion = "";
    $salida = array();
    $entradas = json_decode($contenido, true);
    if ($params["id"] && $params["accion"] == "guardar") {
        for ($i = 0; $i < count($entradas); $i++) {
            if ($params['id'] == $entradas[$i]["id"])
                $posicion = $i;
        }
        $salida["id"] = $params['id'];
    } elseif ($params["id"] && $params["accion"] == "eliminar") {
        // Cambiar el estado de ID a eliminado 0
    } else {
        $posicion = count($entradas);
        $nuevoID = (int)$entradas[$posicion-1]["id"] + 1;
        $entradas[$posicion]["id"] = rellenaDigitos($nuevoID);
        $salida["id"] = rellenaDigitos($nuevoID);
    }
    // Acá se debe reemplazar por una acción de cargar, actualizar o eliminar info a MySQL
    $entradas[$posicion]["titulo"] = $params["titulo"];
    $entradas[$posicion]["categoria"] = $params["categoria"];
    $entradas[$posicion]["subcategoria"] = $params["subcategoria"];
    $entradas[$posicion]["fecha"] = date('Y-m-d');
    $entradas[$posicion]["estado"] = 2;
    // --
    $salida["respuesta"] = true;
    echo json_encode($salida);
}
function rellenaDigitos($valor) {
    $numDigitos = 4;
    $numCeros = $numDigitos - strlen((string)$valor);
    $salida = str_repeat("0",$numCeros).$valor;
    return $salida;
}
?>