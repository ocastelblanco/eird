/* global angular */
var eirdApp = angular.module('eirdApp');
// Enrutamientos
eirdApp.config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {
    $routeProvider
        .when('/', {
            templateUrl :'app/portada/portada.html'
        }).when('/ingreso', {
            templateUrl : 'app/ingreso/ingreso.html'
        }).when('/ingreso/:subseccion', {
            templateUrl : 'app/ingreso/ingreso.html'
        }).when('/restaurar', {
            templateUrl : 'app/ingreso/restaurar.html'
        }).when('/categorias', {
            templateUrl : 'app/categorias/categorias.html'
        }).when('/busqueda', {
            templateUrl : 'app/busqueda/busqueda.html'
        }).when('/entrada', {
            templateUrl : 'app/entrada/entrada.html'
        }).otherwise({
            redirectTo: '/'
        });
        $locationProvider.html5Mode(true);
}]);