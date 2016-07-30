/* global angular firebase sesionUsuario */
var encabezado = angular.module('encabezado', ['eirdAdmin', 'inicio']);
encabezado.controller('creaEncabezado', ['$location', '$route', '$timeout', 'sesion', function($location, $route, $timeout, sesion){
    sesion();
    var salida = this;
    var tiempoEspera = 500;
    if (sesionUsuario.permisos){tiempoEspera = 0}
    $timeout(function(){
        if (sesionUsuario.sesion) {
            salida.haySesion = true;
        } else {
            salida.haySesion = false;
        }
    },tiempoEspera);
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