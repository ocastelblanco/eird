/* global angular firebase */
var config = {
    apiKey: "AIzaSyCfPS6ayXe7S9ddudsiM8LO9HPEGS2CkyA",
    authDomain: "eird-a6f79.firebaseapp.com",
    databaseURL: "https://eird-a6f79.firebaseio.com",
    storageBucket: "eird-a6f79.appspot.com",
};
firebase.initializeApp(config);
var eirdAuth = angular.module('eirdAuth', ['firebase']).config(['$locationProvider', function($locationProvider){
    $locationProvider.html5Mode({enabled: true, requireBase: false, rewriteLinks: false});
}]).controller('controladorPrincipal', ['$firebaseObject', '$location', '$timeout', function($firebaseObject, $location, $timeout){
    console.log('controladorPrincipal iniciado');
    var idioma = 'es';
    var yo = this;
    var ref = firebase.database().ref('/interfaz/'+idioma);
    var interfaz = $firebaseObject(ref);
    interfaz.$loaded().then(function(){
        yo.interfaz = interfaz;
    });
    yo.restaurar = false;
    var emailUsuario;
    var accion = $location.search();
    if (accion.mode == 'resetPassword') {
        firebase.auth().verifyPasswordResetCode(accion.oobCode).then(function(email){
            if (email) {
                emailUsuario = email;
                yo.restaurarClave = true;
                yo.cambiando = false;
                yo.cambiarClave = function() {
                    yo.cambiando = true;
                    firebase.auth().confirmPasswordReset(accion.oobCode, yo.clave).then(function(){
                        $timeout(function(){
                            yo.restaurarClave = false;
                            yo.cambiando = false;
                            yo.claveRestaurada = true;
                        },500);
                    }).catch(function(error){
                        yo.mensajeError = error.code+': '+error.message;
                    });
                };
            }
        }).catch(function(error){
            yo.mensajeError = error.code+': '+error.message;
        });
    }
}]);