/* global angular */
var rutaShared = 'app/shared/';
var inicio = angular.module('inicio', ['eirdAdmin']);
// Verifica si la sesión ha sido iniciada
inicio.controller('inyectaContenido', ['consultaSesion', '$scope', function(consultaSesion, $scope) {
    var salida = this;
    $scope.$on('cargaVista', function(event, resp) {
        salida.cargaVista(resp.pos, resp.vista);
    });
    consultaSesion.hay().then(function(sesion){
        if (sesion.conexion) {
            if (sesion.id) {
                // Hay sesión
                salida.cargaVista('header', rutaShared + 'header.sesion.html');
                salida.cargaVista('contenido', 'app/components/contenido/contenido.html');
                salida.cargaVista('footer', rutaShared + 'footer.html');
            } else {
                // No hay sesión
                salida.cargaVista('header', rutaShared + 'header.noSesion.html');
                salida.cargaVista('contenido', rutaShared + 'loginPanel.html');
                salida.cargaVista('footer', rutaShared + 'footer.html');
            }
        } else {
            // No se logró la conexión con PHP
            salida.mensaje = "Error al conectarse con el sistema. Intente más tarde";
        }
    });
    salida.cierraSesion = function(){
        consultaSesion.cerrar();
        salida.cargaVista('header', rutaShared + 'header.sesion.html');
        salida.cargaVista('contenido', rutaShared + 'loginPanel.html');
        salida.cargaVista('footer', rutaShared + 'footer.html');
    };
    salida.cargaVista = function(pos, vista) {
        salida[pos] = vista;
    };
}]);
// Obtiene datos del usuario autenticado
inicio.controller('datosSesion', ['consultaSesion', function(consultaSesion) {
    var salida = this;
    consultaSesion.datos().then(function(sesion){
        if (sesion.conexion) {
            salida.nombre = sesion.nombre;
        }
    });
}]);
inicio.controller('loginForm', ['$http', 'cargaInterfaz', 'consultaSesion', 'generaID', '$rootScope',
                        function($http, cargaInterfaz, consultaSesion, generaID, $rootScope) {
    var salida = this;
    var titulo;
    cargaInterfaz.textos().then(function(resp){
        titulo = resp.titulos.largo;
    });
    salida.autenticar = function() {
        var datosForm = {'usuario': salida.usuario, 'clave': salida.clave, 'titulo': titulo};
        $http.post('php/autentica.php', datosForm).then(function(resp){
            consultaSesion.crear(generaID(5), resp.data.nombre).then(function(resp){
                $rootScope.$broadcast('cargaVista', {'pos': 'header', 'vista': rutaShared + 'header.sesion.html'});
                $rootScope.$broadcast('cargaVista', {'pos': 'contenido', 'vista': 'app/components/contenido/contenido.html'});
            });
        });
    }
}]);
// Este servicio consulta si hay sesion y cuál es
inicio.service('consultaSesion', ['$http', function($http){
    var ruta = 'php/sesion.php?accion=';
    var consultaSesion = {
        hay: function() {
            var promesa = $http.get(ruta + 'comprobar').then(function(resp){
                return resp.data;
            });
            return promesa;
        }, 
        datos: function() {
            var promesa = $http.get(ruta + 'datos').then(function(resp){
                return resp.data;
            });
            return promesa;
        },
        crear: function(id, nombre) {
            var accion = ruta + 'crear&sesionID='+id+'&nombre='+nombre;
            var promesa = $http.get(accion).then(function(resp){
                return resp.data;
            });
            return promesa;
        },
        cerrar: function() {
            var promesa = $http.get(ruta + 'cerrar').then(function(resp){
                return resp.data;
            });
            return promesa;
        }
    };
    return consultaSesion;
}]);
// Servicio sencillo que genera IDs aleatorios
inicio.service('generaID', [function(){
    return function(max){
        var salida = '';
        for (var i = 0;i<max;i++) {
            var n = Math.floor(Math.random() * 10);
            salida = salida + n;
        }
        return salida;
    };
}]);