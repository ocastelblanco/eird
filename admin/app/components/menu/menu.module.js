/* global angular */
var menuLateral = angular.module('menuLateral', ['eirdAdmin', 'inicio']);
menuLateral.controller('menu', ['consultaSesion', '$location', function(consultaSesion, $location){
    var salida = this;
    salida.seccion = $location.path().split('/')[1];
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