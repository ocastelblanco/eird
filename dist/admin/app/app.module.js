/* global angular firebase */
var idioma = 'es';
var config = {
    apiKey: "AIzaSyCfPS6ayXe7S9ddudsiM8LO9HPEGS2CkyA",
    authDomain: "eird-a6f79.firebaseapp.com",
    databaseURL: "https://eird-a6f79.firebaseio.com",
    storageBucket: "eird-a6f79.appspot.com",
};
firebase.initializeApp(config);
var sesionUsuario = {};
var datosAdmin = {};
// Módulos de la app principal eirdAdmin
var eirdAdmin = angular.module('eirdAdmin', [
    'ui.bootstrap',
    'ui.grid',
    'ui.grid.selection',
    'ui.grid.pagination',
    'ui.tinymce',
    'ngFileUpload',
    'ngRoute',
    'ngTouch',
    'inicio',
    'contenido',
    'encabezado',
    'entradas',
    'editarEntradas',
    'publicar',
    'categorias',
    'portada',
    'papelera',
    'codigos'
]);
// Controladores
eirdAdmin.controller('controladorPrincipal', ['cargaInterfaz', '$timeout', 'sesion', function(cargaInterfaz, $timeout, sesion) {
    // Controlador principal
    console.log('ControladorPrincipal iniciado');
    // Contenidos básicos de la interfaz
    var salida = this;
    cargaInterfaz.textos().then(function(resp){
        salida.textos = resp;
    });
    var user = firebase.auth().currentUser;
    $timeout(function(){
        if (user) {
            firebase.database().ref('administradores').once('value').then(function(datos){
                angular.forEach(datos.val(), function(valor, llave){
                    datosAdmin[valor.email] = valor.permisos;
                });
                sesionUsuario.sesion = true;
                sesionUsuario.email = user.email;
                sesionUsuario.permisos = datosAdmin[sesionUsuario.email];
            });
        }
    },500);
}]);
eirdAdmin.controller('preCarga', ['$rootScope', function($rootScope){
    var salida = this;
    $rootScope.$on('preCargaVisible', function(evento, visible){salida.activo = visible;});
}]);
// Servicios
eirdAdmin.service('cargaInterfaz', ['$http', function($http){
    // Servicio de carga de elementos de interfaz
    var ruta = 'app/shared/'+idioma+'.interfaz.json';
    var cargaInterfaz = {
        textos: function() {
            var promesa = $http.get(ruta).then(function(resp){
                return resp.data.textos;
            });
            return promesa;
        }
    };
    return cargaInterfaz;
}]);
eirdAdmin.service('preCarga', ['$rootScope', function($rootScope){
    var preCarga = function(visible) {
        $rootScope.$emit('preCargaVisible', visible);
        return visible;
    };
    return preCarga;
}]);
eirdAdmin.service('sesion', ['$route', '$location', '$timeout', function($route, $location, $timeout){
    var sesion = function() {
        var user = firebase.auth().currentUser;
        $timeout(function(){
            if(!user) {
                $location.path('/');
                $route.reload();
                sesionUsuario.sesion = null;
                sesionUsuario.email = null;
                sesionUsuario.permisos = null;
                return false;
            } else {
                firebase.database().ref('administradores').once('value').then(function(datos){
                    angular.forEach(datos.val(), function(valor, llave){
                        datosAdmin[valor.email] = valor.permisos;
                    });
                    sesionUsuario.sesion = true;
                    sesionUsuario.email = user.email;
                    sesionUsuario.permisos = datosAdmin[sesionUsuario.email];
                    return true;
                });
            }
        },500);
    };
    return sesion;
}]);
eirdAdmin.service('Excel', ['$window', function($window){
    // Ajustado de https://gist.github.com/umidjons/352da2a4209691d425d4
    var uri='data:application/vnd.ms-excel;base64,';
    var template='<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40"><head><meta http-equiv="Content-Type" content="text/html; charset=UTF-8"><!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>{worksheet}</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]--></head><body><table>{table}</table></body></html>';
    var base64=function(s){return $window.btoa(unescape(encodeURIComponent(s)));};
    var format=function(s,c){return s.replace(/{(\w+)}/g,function(m,p){return c[p];})};
    return {
        tableToExcel:function(tableId,worksheetName){
            var table = document.getElementById(tableId);
            var ctx={
                worksheet:worksheetName,
                table:angular.element(table).html()
            };
            var href=uri+base64(format(template,ctx));
            return href;
        }
    };
}]);