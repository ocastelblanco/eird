<?php
require_once('variables.php');
require_once('medoo.php');
date_default_timezone_set($timezone);
chdir($rutaMedios);
$salida = array("archivo" => $_FILES);
if (!isset($_FILES['file']['type'])){
    $salida["respuesta"] = false;
    $salida["mensaje"] = "El archivo tiene errores. Cámbielo y vuelva a intentar.";
    exit(json_encode($salida));
}
$fichero_subido = hash('md5', time()).$extMedio[$_FILES['file']['type']];
$salida["nombreFinal"] = $fichero_subido;

if (move_uploaded_file($_FILES['file']['tmp_name'], $fichero_subido)) {
    $salida["respuesta"] = true;
} else {
    $salida["respuesta"] = false;
    $salida["mensaje"] = "Posible ataque de subida de archivos. Intente de nuevo.";
}
echo(json_encode($salida));
?>