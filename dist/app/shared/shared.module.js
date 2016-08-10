/* global angular */
var shared = angular.module('shared', []);
shared.controller('barraNavegacion', ['$document','$window','$timeout','Auth',function($document,$window,$timeout,Auth){
    console.log('barraNavegacion');    
    var yo = this;
    var navbar = angular.element(document.querySelector('.navbar'));
    $document.on("scroll", function() {
        if ($document.scrollTop() > 10) {
            navbar.addClass('scrollDown');
        } else {
            navbar.removeClass('scrollDown');
        }
    });
    yo.abreBusqueda = function(abrir) {
        yo.busquedaAbierta = abrir;
        if (abrir) {
            $timeout(function(){
                $window.document.getElementById('inputBusqueda').focus();
            });
        }
        yo.abierta = !abrir;
    };
    yo.auntenticar = Auth;
    yo.auntenticar.$onAuthStateChanged(function(usuario) {
        yo.usuario = usuario;
    });
}]);