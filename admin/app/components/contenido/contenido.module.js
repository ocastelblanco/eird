/* global angular */
var menu = angular.module('menu', []);
menu.controller('menuLateral', ['$window', function($window){
    var salida = this;
    salida.nav = 'app/components/menu/menu.html';
    salida.central = 'app/components/resumen/resumen.html';
    console.log($window.innerHeight);
}]);