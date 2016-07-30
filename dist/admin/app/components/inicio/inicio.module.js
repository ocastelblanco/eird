/* global angular firebase sesionUsuario */
var pagInicial = '/contenido';
var inicio = angular.module('inicio', ['eirdAdmin']);
// Verifica si la sesión ha sido iniciada
inicio.controller('inyectaContenido', ['$scope', '$location', '$timeout', function($scope, $location, $timeout) {
    //console.log('inyectaContenido cargado');
    var salida = this;
    var tiempoEspera = 500;
    if (sesionUsuario.permisos){tiempoEspera = 0}
    $timeout(function(){
        if (sesionUsuario.sesion) {
            // Hay sesión
            $location.path(pagInicial);
        } else {
            // No hay sesión
            salida.header = 'app/components/header/header.html';
            salida.footer = 'app/shared/footer.html';
            salida.contenido = 'app/shared/loginPanel.html';
        }
    }, tiempoEspera);
}]);
// Obtiene datos del usuario autenticado
inicio.controller('datosSesion', ['$timeout', function($timeout) {
    //console.log('datosSesion cargado');
    var salida = this;
    salida.nombre = sesionUsuario.email;
}]);
inicio.controller('loginForm', ['$location', '$timeout', function($location, $timeout) {
    //console.log('loginForm cargado');
    var salida = this;
    salida.autenticar = function() {
        firebase.auth().signInWithEmailAndPassword(salida.usuario, salida.clave).then(function(){
            var user = firebase.auth().currentUser;
            $timeout(function(){
                if (user) {
                    sesionUsuario.sesion = true;
                    sesionUsuario.email = user.email;
                    firebase.database().ref('administradores/').once('value').then(function(datos){
                        angular.forEach(datos.val(), function(valor, llave){
                            if(valor.email == user.email) {
                                sesionUsuario.permisos = valor.permisos;
                            }
                        });
                    });
                }
            },500);
            $location.path(pagInicial);
        }).catch(function(error) {
            $timeout(function(){
                salida.error = error.code+': '+error.message;
                console.log('Error de autenticación', salida.error);
            },500);
        });
    };
}]);