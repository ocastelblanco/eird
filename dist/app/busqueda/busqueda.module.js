/* global angular firebase */
var busqueda = angular.module('busqueda', []);
busqueda.controller('contBusqueda', ['$route', '$firebaseArray', '$location', function($route, $firebaseArray, $location){
    console.log('contBusqueda');
    var yo = this;
    yo.header = 'app/shared/header.html';
    yo.termino = $route.current.params.termino;
    if (yo.termino == 'undefined') {
        $location.path('/');
    }
    var terminos = yo.termino.split(' ');
    var ref = firebase.database().ref('entradas/').orderByChild('titulo');
    var fa = $firebaseArray(ref);
    yo.entradas = [];
    fa.$loaded().then(function(){
        angular.forEach(fa, function(valor,llave){
            var anexado = false;
            angular.forEach(terminos, function(termino,key){
                if ((valor.titulo.indexOf(termino) > -1 || 
                    valor.categoria.indexOf(termino) > -1 ||
                    valor.subcategoria.indexOf(termino) > -1) && !anexado) {
                    yo.entradas.push(valor);
                    anexado = true;
                }
                angular.forEach(valor.palabrasClave, function(palabra,clave){
                    if (palabra.indexOf(termino) > -1 && !anexado) {
                        yo.entradas.push(valor);
                        anexado = true;
                    }
                });
            });
        });
    });
    yo.abrirEntrada = function(id) {
        $location.path('/entrada/'+id);
    };
}]);