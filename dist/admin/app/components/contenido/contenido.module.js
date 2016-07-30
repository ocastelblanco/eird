/* global angular sesionUsuario*/
var subInicial = {'contenido': 'entradas'};
var contenido = angular.module('contenido', []);
contenido.controller('controladorContenido', ['$routeParams', '$location', '$timeout', function($routeParams, $location, $timeout){
    console.log('controladorContenido cargado');
    var salida = this;
    salida.params = $routeParams;
    salida.seccion = $location.path().split('/')[1];
    var tiempoEspera = 1000;
    if (sesionUsuario.permisos){tiempoEspera = 0}
    $timeout(function(){
        salida.header = 'app/components/header/header.html';
        salida.footer = 'app/shared/footer.html';
        salida.nav = 'app/components/menu/menu.html';
        if (!salida.params.subseccion) {
            $location.path('/'+salida.seccion+'/'+subInicial[salida.seccion]);
        } else {
            salida.central = 'app/components/'+salida.seccion+'/'+salida.params.subseccion+'/'+salida.params.subseccion+'.html';
        }
        // Consulta de permisos del usuario, según su login, usados por todas las vistas
        $timeout(function(){
            salida.permisos = sesionUsuario.permisos;
        },tiempoEspera);
    },tiempoEspera);
}]);
contenido.controller('menuLateral', ['$location', 'cargaInterfaz', '$routeParams', function($location, cargaInterfaz, $routeParams){
    //console.log('menuLateral cargado');
    var salida = this;
    salida.seccion = $location.path().split('/')[1];
    cargaInterfaz.textos().then(function(resp){
        salida.items = resp.barra[salida.seccion].menu.items;
    });
    salida.params = $routeParams;
    salida.esActivo = function(elem){
        if (elem == salida.params.subseccion || (elem == "entradas" && salida.params.subseccion == "editarEntrada")) {
            return 'active';
        } else {
            return '';
        }
    };
}]);