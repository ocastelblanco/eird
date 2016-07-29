/* global angular */
var pagInicial = '/contenido';
var inicio = angular.module('inicio', ['eirdAdmin']);
// Verifica si la sesión ha sido iniciada
inicio.controller('inyectaContenido', ['consultaSesion', '$scope', '$location', function(consultaSesion, $scope, $location) {
    //console.log('inyectaContenido cargado');
    var salida = this;
    consultaSesion.hay().then(function(sesion){
        if (sesion.conexion) {
            if (sesion.id) {
                // Hay sesión
                $location.path(pagInicial);
            } else {
                // No hay sesión
                salida.header = 'app/components/header/header.html';
                salida.footer = 'app/shared/footer.html';
                salida.contenido = 'app/shared/loginPanel.html';
            }
        } else {
            // No se logró la conexión con PHP
            salida.mensaje = "Error al conectarse con el sistema. Intente más tarde";
        }
    });
}]);
// Obtiene datos del usuario autenticado
inicio.controller('datosSesion', ['consultaSesion', function(consultaSesion) {
    //console.log('datosSesion cargado');
    var salida = this;
    consultaSesion.datos().then(function(sesion){
        if (sesion.conexion) {
            salida.nombre = sesion.nombre;
        }
    });
}]);
inicio.controller('loginForm', ['$http', 'cargaInterfaz', 'consultaSesion', 'generaID', '$rootScope', '$location',
                        function($http, cargaInterfaz, consultaSesion, generaID, $rootScope, $location) {
    //console.log('loginForm cargado');
    var salida = this;
    var titulo;
    cargaInterfaz.textos().then(function(resp){
        titulo = resp.titulos.largo;
    });
    salida.autenticar = function() {
        var datosForm = {'usuario': salida.usuario, 'clave': salida.clave, 'titulo': titulo};
        $http.post('php/autentica.php', datosForm).then(function(resp){
            consultaSesion.crear(generaID(5), resp.data.nombre, resp.data.permisos).then(function(resp){
                $location.path(pagInicial);
            });
        });
    };
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
        },
        crear: function(id, nombre, permisos) {
            var accion = ruta + 'crear&sesionID='+id+'&nombre='+nombre+'&permisos='+permisos;
            var promesa = $http.get(accion).then(function(resp){
                return resp.data;
            });
            return promesa;
        },
        cerrar: function() {
            var promesa = $http.get(ruta + 'cerrar').then(function(resp){
                return resp.data;
            });
            return promesa;
        }
    };
    return consultaSesion;
}]);
// Servicio sencillo que genera IDs aleatorios
inicio.service('generaID', [function(){
    return function(max){
        var salida = '';
        for (var i = 0;i<max;i++) {
            var n = Math.floor(Math.random() * 10);
            salida = salida + n;
        }
        return salida;
    };
}]);