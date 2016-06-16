/* global angular */
var subInicial = {'contenido': 'entradas'};
var contenido = angular.module('contenido', []);
contenido.controller('controladorContenido', ['$routeParams', '$location', function($routeParams, $location){
    console.log('controladorContenido cargado');
    var salida = this;
    salida.params = $routeParams;
    salida.seccion = $location.path().split('/')[1];
    salida.header = 'app/components/header/header.html';
    salida.footer = 'app/shared/footer.html';
    salida.nav = 'app/components/menu/menu.html';
    if (!salida.params.subseccion) {
        $location.path('/'+salida.seccion+'/'+subInicial[salida.seccion]);
    } else {
        salida.central = 'app/components/'+salida.seccion+'/'+salida.params.subseccion+'/'+salida.params.subseccion+'.html';
    }
}]);
contenido.controller('menuLateral', ['consultaSesion', '$location', 'cargaInterfaz', '$routeParams',
                            function(consultaSesion, $location, cargaInterfaz, $routeParams){
    //console.log('menuLateral cargado');
    var salida = this;
    salida.seccion = $location.path().split('/')[1];
    cargaInterfaz.textos().then(function(resp){
        salida.items = resp.barra[salida.seccion].menu.items;
    });
    consultaSesion.datos().then(function(resp){
        salida.permisos = resp.permisos;
    });
    salida.params = $routeParams;
    salida.esActivo = function(elem){
        if (elem == salida.params.subseccion) {
            return 'active';
        } else {
            return '';
        }
    };
}]);