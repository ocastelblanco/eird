/* global angular */
var eirdAdmin = angular.module('eirdAdmin');
// Enrutamientos

eirdAdmin.config(['$routeProvider', function($routeProvider) {
    $routeProvider
        .when('/', {
            templateUrl :'app/components/inicio/inicio.html'
        }).when('/inicio', {
            templateUrl : 'app/components/inicio/inicio.html'
        }).when('/salir', {
            templateUrl : 'app/components/inicio/inicio.html'
        }).when('/contenido', {
            templateUrl : 'app/components/contenido/contenido.html'
        }).when('/contenido/:subseccion', {
            templateUrl : 'app/components/contenido/contenido.html',
            reloadOnSearch: false
        }).when('/codigos', {
            templateUrl : 'app/components/codigos/codigos.html'
        }).otherwise({
            redirectTo: '/'
        });
}]);
