/* global angular */
var idioma = 'es';
var rutaMedios = '../media/';
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
    'publicar'
]);
// Controladores
eirdAdmin.controller('controladorPrincipal', ['cargaInterfaz', function(cargaInterfaz) {
    // Controlador principal
    console.log('ControladorPrincipal iniciado');
    // Contenidos básicos de la interfaz
    var salida = this;
    cargaInterfaz.textos().then(function(resp){
        salida.textos = resp;
    });
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