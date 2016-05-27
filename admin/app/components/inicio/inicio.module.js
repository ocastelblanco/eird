/* global angular */
var inicio = angular.module('inicio', []);
// Verifica si la sesión ha sido iniciada
inicio.controller('inyectaContenido', ['consultaSesion', function(consultaSesion) {
    var salida = this;
    consultaSesion.hay().then(function(sesion){
        if (sesion.conexion) {
            if (sesion.id) {
                // Hay sesión
                salida.header = "app/shared/header.sesion.html";
            } else {
                // No hay sesión
                salida.header = "app/shared/header.noSesion.html";
                salida.contenido = "app/shared/loginPanel.html";
            }
        } else {
            salida.mensaje = "Error al conectarse con el sistema. Intente más tarde";
        }
    });
}]);
// Obtiene datos del usuario autenticado
inicio.controller('datosSesion', ['consultaSesion', function(consultaSesion) {
    var salida = this;
    consultaSesion.datos().then(function(sesion){
        if (sesion.conexion) {
            salida.nombre = sesion.nombre;
        }
    });
}]);
inicio.controller('loginForm', [function(){
    var salida = this;
    salida.autenticar = function() {
        console.log('loginForm ', salida.usuario);
    }
}]);
// Este servicio consulta si hay sesion y cuál es
inicio.service('consultaSesion', ['$http', function($http){
    var ruta = 'php/sesion.php?accion=';
    var consultaSesion = {
        hay: function() {
            var promesa = $http.get(ruta + 'comprobar').then(function(resp){
                return resp.data;
            });
            return promesa;
        }, 
        datos: function() {
            var promesa = $http.get(ruta + 'datos').then(function(resp){
                return resp.data;
            });
            return promesa;
        }
    };
    return consultaSesion;
}]);