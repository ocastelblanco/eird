/* global angular */
var portada = angular.module('portada', []);
portada.controller('articuloDestacado', ['cargaInterfaz', function(cargaInterfaz){
    //console.log('Artidulo destacado cargado');
    var salida = this;
    cargaInterfaz.textos().then(function(resp){
        salida.opciones = resp.contenido.portada.articuloDestacado.opciones;
    });
}]);