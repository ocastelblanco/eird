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
            templateUrl : 'app/components/inicio/inicio.html',
            controller  : 'controladorPrincipal'
        })
        .when('/contacto', {
            templateUrl : 'pages/contacto.html',
            controller  : 'contactController'
        })
        .otherwise({
            redirectTo: '/'
        });
        $locationProvider.html5Mode(true);
}]);