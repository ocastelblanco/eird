/* global angular firebase sesionUsuario */
var encabezado = angular.module('encabezado', ['eirdAdmin', 'inicio']);
encabezado.controller('creaEncabezado', ['$location', '$route', '$timeout', function($location, $route, $timeout){
    var salida = this;
    salida.cierraSesion = function(){
        firebase.auth().signOut().then(function(){
            $location.path('/');
            $route.reload();
            sesionUsuario.sesion = null;
            sesionUsuario.email = null;
            sesionUsuario.permisos = null;
        });
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