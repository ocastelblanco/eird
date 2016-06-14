/* global angular */
var encabezado = angular.module('encabezado', ['eirdAdmin', 'inicio']);
encabezado.controller('creaEncabezado', ['consultaSesion', '$location', function(consultaSesion, $location){
    var salida = this;
    consultaSesion.hay().then(function(sesion){
        salida.haySesion = false;
        if(sesion.conexion && sesion.id) {
            salida.haySesion = true;
        }
    });
    consultaSesion.datos().then(function(resp){
        salida.permisos = resp.permisos;
    });
    salida.cierraSesion = function(){
        consultaSesion.cerrar();
    };
    salida.esActivo = function(elem, nivel){
        var actual = $location.path().split('/');
        if (elem == actual[nivel]) {
            return 'active';
        } else {
            return '';
        }
    };
}]);