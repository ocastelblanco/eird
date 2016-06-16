/* global angular */
var eirdAdmin = angular.module('eirdAdmin');
// Enrutamientos
eirdAdmin.config(['$routeProvider', '$locationProvider',
    function($routeProvider, $locationProvider) {
    $routeProvider
        .when('/', {
            templateUrl :'app/components/inicio/inicio.html'
        })
        .when('/inicio', {
            templateUrl : 'app/components/inicio/inicio.html'
        })
        .when('/salir', {
            templateUrl : 'app/components/inicio/inicio.html'
        })
        .when('/contenido', {
            templateUrl : 'app/components/contenido/contenido.html'
        })
        .when('/contenido/:subseccion', {
            templateUrl : 'app/components/contenido/contenido.html'
        })
        .otherwise({
            redirectTo: '/'
        });
        //$locationProvider.html5Mode(true);
}]);