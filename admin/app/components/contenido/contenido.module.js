/* global angular */
var contenido = angular.module('contenido', ['eirdAdmin']);
contenido.controller('controladorContenido', [function(){
    var salida = this;
    salida.header = 'app/components/header/header.html';
    salida.footer = 'app/shared/footer.html';
    salida.nav = 'app/components/menu/menu.html';
    salida.central = 'app/components/resumen/resumen.html';
}]);
contenido.controller('menuLateral', ['consultaSesion', '$location', 'cargaInterfaz',
                            function(consultaSesion, $location, cargaInterfaz){
    var salida = this;
    salida.seccion = $location.path().split('/')[1];
    cargaInterfaz.textos().then(function(resp){
        salida.items = resp.barra[salida.seccion].menu.items;
    });
    consultaSesion.datos().then(function(resp){
        salida.permisos = resp.permisos;
    });
    salida.esActivo = function(elem, nivel){
        var actual = $location.path().split('/');
        if (elem == actual[nivel]) {
            return 'active';
        } else {
            return '';
        }
    };
}]);