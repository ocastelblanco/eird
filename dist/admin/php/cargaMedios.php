<?php
chdir('../../media');
$fichero_subido = basename($_FILES['file']['name']);
echo "Intendando subir ".basename($_FILES['file']['name']);
if (move_uploaded_file($_FILES['file']['tmp_name'], $fichero_subido)) {
    echo "El fichero es válido y se subió con éxito.\n";
} else {
    echo "¡Posible ataque de subida de ficheros!\n";
}

echo 'Más información de depuración:';
print_r($_FILES);
?>