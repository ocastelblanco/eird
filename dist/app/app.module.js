/* global angular firebase */
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
    'ngAnimate',
    'firebase',
    'ui.bootstrap',
    'duScroll',
    'shared',
    'portada',
    'ingreso'
]);
eirdApp.controller('controladorPrincipal', ['$firebaseObject', function($firebaseObject){
    console.log('controladorPrincipal iniciado');
    var idioma = 'es';
    var yo = this;
    var ref = firebase.database().ref('/interfaz/'+idioma);
    var interfaz = $firebaseObject(ref);
    interfaz.$loaded().then(function(){
        yo.interfaz = interfaz;
    });
}]);
eirdApp.service('Auth', ['$firebaseAuth', function($firebaseAuth){
    return $firebaseAuth();
}]);