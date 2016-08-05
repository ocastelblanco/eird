/* global angular */
var shared = angular.module('shared', []);
shared.controller('barraNavegacion', ['$document',function($document){
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
    yo.abreBusqueda = function() {
        
    };
    
    
    yo.sesionActiva = true;
}]);