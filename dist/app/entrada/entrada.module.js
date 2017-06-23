/* global angular firebase */
var entrada = angular.module('entrada', []);
entrada.controller('adminEntrada', ['$route', '$firebaseObject', function($route, $firebaseObject){
    console.log('adminEntrada');
    var yo = this;
    yo.header = 'app/shared/header.html';
    var idEntrada = $route.current.params.id;
    var ref = firebase.database().ref('entradas/'+idEntrada+'/');
    yo.entrada = $firebaseObject(ref);
    yo.entrada.$loaded().then(function(){
        //
    });
}]);