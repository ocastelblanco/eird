/* global angular */
var portada = angular.module('portada', []);
portada.controller('adminPortada', [function(){
    console.log('adminPortada cargada');
    var yo = this;
    yo.header = 'app/shared/header.html';
}]);
portada.controller('artDestacado', [function(){
    console.log('artDestacado');
}]);