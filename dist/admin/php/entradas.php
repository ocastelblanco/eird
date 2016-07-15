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

// Si no se envían parámetros POST, se responde con un listado de entradas en JSON
if (count($params) == 0) {
    echo $contenido;
} elseif ($params["id"] && $params["accion"] == "listarEntrada") {
    // Cuando se solicita información específica de una entrada específica con ID
    $info = json_decode($contenido, true);
    for ($i = 0; $i < count($info); $i++) {
        if ($params['id'] == $info[$i]["id"])
            $posicion = $i;
    }
    $entrada = $info[$posicion];
    echo json_encode($entrada, JSON_UNESCAPED_UNICODE);
} else {// Si la solicitud viene con parámetros, se debe o crear un nuevo ID o guardar en el enviado
    $posicion = "";
    $salida = array();
    $entradas = json_decode($contenido, true);
    // Se solicita guardar o eliminar una entrada ya existente
    if ($params["id"]) {
        for ($i = 0; $i < count($entradas); $i++) {
            if ($params['id'] == $entradas[$i]["id"])
                $posicion = $i;
        }
        $salida["id"] = $params['id'];
    } else {
        // No se recibió ID, por lo tanto se crea uno nuevo
        $posicion = count($entradas);
        $nuevoID = (int)$entradas[$posicion-1]["id"] + 1;
        $salida["id"] = rellenaDigitos($nuevoID, $numDigitosID);
        $entradas[$posicion]["id"] = $salida["id"];
    }
    if ($params["accion"] == "eliminar") {
        $entradas[$posicion]["estado"] = 0;
    } elseif ($params["accion"] != "eliminaEntradas" && $params["accion"] != "publicarEntradas") {
        $entradas[$posicion]["titulo"] = $params["titulo"];
        $entradas[$posicion]["texto"] = $params["texto"];
        $entradas[$posicion]["categoria"] = $params["categoria"];
        $entradas[$posicion]["subcategoria"] = $params["subcategoria"];
        $entradas[$posicion]["palabrasClave"] = $params["palabrasClave"];
        $entradas[$posicion]["medios"] = $params["medios"];
        $entradas[$posicion]["fecha"] = date('Y-m-d h:i:sa');
        $entradas[$posicion]["estado"] = 2;
    }
    if ($params["accion"] == "eliminaEntradas") {
        $salida["accion"] = $params["accion"];
        $idBorrar = $params["entradas"];
        $salida["entradas"] = $idBorrar;
        for ($i = 0; $i < count($entradas); $i++) {
            for ($e = 0; $e < count($idBorrar); $e++) {
                if ($idBorrar[$e] == $entradas[$i]["id"])
                    $entradas[$i]["estado"] = 0;
                }
        }
    }
    if($params["accion"] == "publicarEntradas") {
        foreach($params["idEntradas"] as $idEntrada) {
            foreach($entradas as $llave => $entrada) {
                if ($entrada["id"] == $idEntrada) {
                    $entradas[$llave]["estado"] = 1;
                }
            }
        }
    }
    // Acá se debe reemplazar por una acción de cargar, actualizar o eliminar info a MySQL, a partir de $entradas
    file_put_contents($nombre_fichero, json_encode($entradas, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT));
    // --
    $salida["respuesta"] = true;
    echo json_encode($salida);
}
function rellenaDigitos($valor, $numDigitosID) {
    $numCerosValor = strlen((string)$valor);
    $numCeros = $numDigitosID - $numCerosValor;
    $salida = str_repeat("0",$numCeros).$valor;
    return $salida;
}
?>