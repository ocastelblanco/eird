/* global angular */
// Módulos de la app principal eirdAdmin
var eirdAdmin = angular.module('eirdAdmin', [
    'ui.bootstrap',
    'ngRoute',
    'inicio'
]);
// Controladores
eirdAdmin.controller('controladorPrincipal', ['cargaInterfaz', function(cargaInterfaz) {
    // Controlador principal
    console.log('ControladorPrincipal iniciado');
    // Contenidos básicos de la interfaz
    /*
    var interfaz = {
        textos: function() {
            var promesa = $http.get('app/shared/es.interfaz.json').then(function(resp){
                console.log(resp.data['textos']);
                return resp.data.textos;
            });
            return promesa;
        }
    };
    var interfaz = function(nombre) {
        var promesa = $http.get('app/shared/es.interfaz.json').then(function(resp){
            console.log(resp.data.textos[nombre]);
            return resp.data.textos[nombre];
        });
        return promesa;
    };
    */
    var salida = this;
    salida.titulos = cargaInterfaz.textos().then(function(r){
        console.log(r);
        return r;
    });
}]);

// Servicios
eirdAdmin.service('cargaInterfaz', ['$http', function($http){
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