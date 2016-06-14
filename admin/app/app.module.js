/* global angular */
// Módulos de la app principal eirdAdmin
var eirdAdmin = angular.module('eirdAdmin', [
    'ui.bootstrap',
    'ngRoute',
    'inicio',
    'contenido',
    'encabezado'
]);
// Controladores
eirdAdmin.controller('controladorPrincipal', ['cargaInterfaz', '$rootScope', function(cargaInterfaz, $rootScope) {
    // Controlador principal
    console.log('ControladorPrincipal iniciado');
    // Contenidos básicos de la interfaz
    var salida = this;
    cargaInterfaz.textos().then(function(resp){
        salida.textos = resp;
    });
    $rootScope.$on('$routeChangeStart', function(angularEvent, next, current) {
        //angularEvent.preventDefault();
        //console.log(angularEvent, next, current);
    });
}]);
// Servicios
eirdAdmin.service('cargaInterfaz', ['$http', function($http){
    // Servicio de carga de elementos de interfaz
    var ruta = 'app/shared/es.interfaz.json';
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