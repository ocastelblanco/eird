/* global angular firebase */
var idioma = 'es';
var config = {
    apiKey: "AIzaSyCfPS6ayXe7S9ddudsiM8LO9HPEGS2CkyA",
    authDomain: "eird-a6f79.firebaseapp.com",
    databaseURL: "https://eird-a6f79.firebaseio.com",
    storageBucket: "eird-a6f79.appspot.com",
};
firebase.initializeApp(config);
var eirdApp = angular.module('eirdApp', [
    'ngRoute',
    'ngTouch',
    'ngSanitize',
    'ui.bootstrap',
    'duScroll',
    'shared',
    'portada'
]);
eirdApp.controller('controladorPrincipal', [function(){
    console.log('controladorPrincipal iniciado');   
    var salida = this;
    salida.resultado = salida.valor * 100;
}]);