/* global angular firebase */
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
    yo.salir = function(){
        Auth.$signOut();
    };
}]);
shared.controller('adminBusqueda', ['$firebaseArray',function($firebaseArray){
    console.log('adminBusqueda');
    var yo = this;
    var ref = firebase.database().ref('entradas/').orderByChild('titulo');
    var fa = $firebaseArray(ref);
    var hintsControl = [];
    yo.hints = [];
    fa.$loaded().then(function(){
        angular.forEach(fa, function(valor, llave){
            var titulo = {'titulo': valor.titulo, 'icono': 'fa-font', 'tipo': 'Titulo de entrada'};
            var categoria = {'titulo': valor.categoria, 'icono': 'fa-tag', 'tipo': 'Categoría'};
            var subcategoria = {'titulo': valor.subcategoria, 'icono': 'fa-tags', 'tipo': 'Subcategoría'};
            if(hintsControl.indexOf(titulo.titulo) < 0) {
                hintsControl.push(titulo.titulo);
                yo.hints.push(titulo);
            }
            if(hintsControl.indexOf(categoria.titulo) < 0) {
                hintsControl.push(categoria.titulo);
                yo.hints.push(categoria);
            }
            if(hintsControl.indexOf(subcategoria.titulo) < 0) {
                hintsControl.push(subcategoria.titulo);
                yo.hints.push(subcategoria);
            }
            angular.forEach(valor.palabrasClave, function(value, key){
                var palabraClave = {'titulo': value, 'icono': 'fa-bookmark', 'tipo': 'Palabras clave'};
                if(hintsControl.indexOf(palabraClave.titulo) < 0) {
                    hintsControl.push(palabraClave.titulo);
                    yo.hints.push(palabraClave);
                }
            });
        });
    });
    yo.buscar = function(){
        console.log(yo.termino);
    };
    yo.obtenerTerminos = function(valor) {
        
    };
}]);