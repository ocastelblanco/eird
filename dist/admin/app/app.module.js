/* global angular firebase */
var idioma = 'es';
var config = {
    apiKey: "AIzaSyCfPS6ayXe7S9ddudsiM8LO9HPEGS2CkyA",
    authDomain: "eird-a6f79.firebaseapp.com",
    databaseURL: "https://eird-a6f79.firebaseio.com",
    storageBucket: "eird-a6f79.appspot.com",
};
firebase.initializeApp(config);
var sesionUsuario = {};
var datosAdmin = {};
// Módulos de la app principal eirdAdmin
var eirdAdmin = angular.module('eirdAdmin', [
    'ui.bootstrap',
    'ui.grid',
    'ui.grid.selection',
    'ui.grid.pagination',
    'ui.tinymce',
    'ngFileUpload',
    'ngRoute',
    'ngTouch',
    'inicio',
    'contenido',
    'encabezado',
    'entradas',
    'editarEntradas',
    'publicar',
    'categorias',
    'portada',
    'papelera',
    'codigos'
]);
// Controladores
eirdAdmin.controller('controladorPrincipal', ['cargaInterfaz', '$timeout', 'sesion', function(cargaInterfaz, $timeout, sesion) {
    // Controlador principal
    console.log('ControladorPrincipal iniciado');
    // Contenidos básicos de la interfaz
    var salida = this;
    cargaInterfaz.textos().then(function(resp){
        salida.textos = resp;
    });
    var user = firebase.auth().currentUser;
    $timeout(function(){
        if (user) {
            firebase.database().ref('administradores').once('value').then(function(datos){
                angular.forEach(datos.val(), function(valor, llave){
                    datosAdmin[valor.email] = valor.permisos;
                });
                sesionUsuario.sesion = true;
                sesionUsuario.email = user.email;
                sesionUsuario.permisos = datosAdmin[sesionUsuario.email];
            });
        }
    },500);
}]);
eirdAdmin.controller('preCarga', ['$rootScope', function($rootScope){
    var salida = this;
    $rootScope.$on('preCargaVisible', function(evento, visible){salida.activo = visible;});
}]);
// Servicios
eirdAdmin.service('cargaInterfaz', ['$http', function($http){
    // Servicio de carga de elementos de interfaz
    var ruta = 'app/shared/'+idioma+'.interfaz.json';
    var cargaInterfaz = {
        textos: function() {
            var promesa = $http.get(ruta).then(function(resp){
                return resp.data.textos;
            });
            return promesa;
        }
    };
    return cargaInterfaz;
}]);
eirdAdmin.service('preCarga', ['$rootScope', function($rootScope){
    var preCarga = function(visible) {
        $rootScope.$emit('preCargaVisible', visible);
        return visible;
    };
    return preCarga;
}]);
eirdAdmin.service('sesion', ['$route', '$location', '$timeout', function($route, $location, $timeout){
    var sesion = function() {
        var user = firebase.auth().currentUser;
        $timeout(function(){
            if(!user) {
                $location.path('/');
                $route.reload();
                sesionUsuario.sesion = null;
                sesionUsuario.email = null;
                sesionUsuario.permisos = null;
                return false;
            } else {
                firebase.database().ref('administradores').once('value').then(function(datos){
                    angular.forEach(datos.val(), function(valor, llave){
                        datosAdmin[valor.email] = valor.permisos;
                    });
                    sesionUsuario.sesion = true;
                    sesionUsuario.email = user.email;
                    sesionUsuario.permisos = datosAdmin[sesionUsuario.email];
                    return true;
                });
            }
        },500);
    };
    return sesion;
}]);