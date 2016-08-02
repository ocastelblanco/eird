/* global angular sesionUsuario */
var codigos = angular.module('codigos', []);
codigos.controller('cargaCodigos', ['$location', '$timeout', 'sesion',function($location, $timeout, sesion){
    console.log('cargaCodigos cargado');
    sesion();
    var salida = this;
    salida.footer = 'app/shared/footer.html';
    var tiempoEspera = 500;
    if (sesionUsuario.permisos) {tiempoEspera = 0;}
    $timeout(function(){
        salida.permisos = sesionUsuario.permisos;
        salida.header = 'app/components/header/header.html';
        salida.central = 'app/components/codigos/admin.html';
    },tiempoEspera);
}]);
codigos.controller('adminCodigos', ['preCarga', 'cargaInterfaz', '$uibModal', function(preCarga, cargaInterfaz, $uibModal){
    var salida = this;
    cargaInterfaz.textos().then(function(datos){
        salida.textos = datos.codigos;
        preCarga(false);
    });
    salida.crear = function(){
        salida.modalCrearCodigo = $uibModal.open({
            templateUrl: 'app/components/codigos/modalCodigos.html',
            controller: modalCreaCodigos,
            windowClass: 'modal-codigos'
        });
    };
    var modalCreaCodigos = ['$scope', '$uibModalInstance', function($scope, $uibModalInstance){
        $scope.titulo = salida.textos.modal.tituloCrear;
        $scope.instrucciones = salida.textos.modal.instruccionesCrear;
        $scope.textos = salida.textos.modal;
        $scope.abrirFecha = function(){
            $scope.fechaAbierto = true;
        };
        $scope.cancelar = function(){
            $uibModalInstance.dismiss();
        };
        $scope.valido = function() {
            if ($scope.numCodigos < 1 || $scope.fechaValidez.length < 4 || $scope.identificador.length < 4) {
                return true;
            } else {
                return false;
            }
        };
    }];
}]);