/* global angular firebase sesionUsuario idioma */
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
codigos.controller('adminCodigos', ['preCarga', 'cargaInterfaz', '$uibModal', 'i18nService', '$timeout', '$scope',  'Excel', function(preCarga, cargaInterfaz, $uibModal, i18nService, $timeout, $scope, Excel){
    var salida = this;
    salida.rutaDB = 'codigos/';
    salida.datosTabla = {
        enableRowSelection: true,
        enableSelectAll: true,
        enableFiltering: true,
        selectionRowHeaderWidth: 35,
        rowHeight: 35,
        showGridFooter:true,
        paginationPageSizes: [10, 20, 50],
        paginationPageSize: 10,
        gridMenuShowHideColumns: false,
        exporterCsvFilename: 'codigos.csv',
        columnDefs: [
                {name: 'codigo'},
                {name: 'identificador'},
                {name: 'validez'},
                {name: 'email'},
                {name: 'estado'},
                {name: 'observaciones', visible: false}
        ]
    };
    salida.estadoEditar = true;
    salida.estadoEliminar = true;
    salida.estadoExportar = true;
    salida.numFilasSeleccionadas = 0;
    i18nService.setCurrentLang(idioma);
    cargaInterfaz.textos().then(function(datos){
        salida.textos = datos.codigos;
        salida.datosTabla.columnDefs = [
            {name: 'codigo', displayName: salida.textos.encabezadoTablaDatos.codigo, enableColumnMenu: false},
            {name: 'identificador', displayName: salida.textos.encabezadoTablaDatos.identificador, enableColumnMenu: false},
            {name: 'validez', displayName: salida.textos.encabezadoTablaDatos.validez, enableColumnMenu: false},
            {name: 'email', displayName: salida.textos.encabezadoTablaDatos.email, enableColumnMenu: false},
            {name: 'estado', displayName: salida.textos.encabezadoTablaDatos.estado, enableColumnMenu: false},
            {name: 'observaciones', visible: false}
        ];
        firebase.database().ref(salida.rutaDB).on('value', function(datos){
            var tabla = [];
            angular.forEach(datos.val(), function(valor, llave){
                tabla.push({
                    'codigo': llave,
                    'identificador': valor.identificador,
                    'validez': valor.fechaValidez.substr(0,10),
                    'email': valor.email,
                    'estado': salida.textos.estadosCodigo[valor.estado],
                    'observaciones': valor.observaciones
                });
            });
            $timeout(function(){
                salida.datosTabla.data = tabla;
                preCarga(false);
            },500);
        });
    });
    // Captura cuando el usuario selecciona filas de la tabla
    salida.datosTabla.onRegisterApi = function(gridApi){
        $scope.gridApi = gridApi;
        gridApi.selection.on.rowSelectionChanged($scope,function(row){
            salida.filasSeleccionadas = gridApi.selection.getSelectedRows();
            salida.numFilasSeleccionadas = gridApi.selection.getSelectedCount();
            salida.activaBotones();
        });
        gridApi.selection.on.rowSelectionChangedBatch($scope,function(rows){
            salida.filasSeleccionadas = gridApi.selection.getSelectedRows();
            salida.numFilasSeleccionadas = gridApi.selection.getSelectedCount();
            salida.activaBotones();
        });
    };
    salida.activaBotones = function(){
        if (salida.numFilasSeleccionadas > 0) {
            salida.estadoEditar = false;
            salida.estadoEliminar = false;
            salida.estadoExportar = false;
        } else {
            salida.estadoEditar = true;
            salida.estadoEliminar = true;
            salida.estadoExportar = true;
        }
    };
    salida.crear = function(){
        salida.modalCodigo = $uibModal.open({
            templateUrl: 'app/components/codigos/modalCodigos.html',
            controller: modalCreaCodigos,
            windowClass: 'modal-codigos',
            backdrop: 'static',
            keyboard: false
        });
        salida.modalCodigo.result.then(function(){
            $scope.gridApi.selection.clearSelectedRows();
            salida.estadoEditar = true;
            salida.estadoEliminar = true;
            salida.estadoExportar = true;
        });
    };
    var modalCreaCodigos = ['$scope', '$uibModalInstance', '$timeout', function($scope, $uibModalInstance, $timeout){
        $scope.numCodigos = 10;
        $scope.maxCodigos = $scope.numCodigos;
        $scope.fechaValidez = '';
        $scope.identificador = '';
        $scope.titulo = salida.textos.modal.tituloCrear;
        $scope.instrucciones = salida.textos.modal.instruccionesCrear;
        $scope.textos = salida.textos.modal;
        $scope.abrirFecha = function(){
            $scope.fechaAbierto = true;
        };
        $scope.cancelar = function(){
            $uibModalInstance.close();
        };
        $scope.valido = function() {
            if ($scope.numCodigos < 1 || $scope.fechaValidez.length < 4 || $scope.identificador.length < 4) {
                return true;
            } else {
                return false;
            }
        };
        $scope.aceptar = function(){
            $scope.maxCodigos = $scope.numCodigos;
            if ($scope.numCodigos && $scope.fechaValidez && $scope.identificador) {
                $scope.cancelar = null;
                $scope.aceptar = null;
                $scope.textoProgreso = salida.textos.modal.progresoCreacion;
                $scope.verProgreso = true;
                $scope.progreso = 0;
                crearCodigo();
            }
        };
        function crearCodigo() {
            $timeout(function(){
                if ($scope.progreso < $scope.numCodigos) {
                    var objeto = {'identificador': $scope.identificador, 'fechaValidez': $scope.fechaValidez.toJSON(), 'email': '', 'estado': 0, 'observaciones': $scope.observaciones};
                    firebase.database().ref(salida.rutaDB).push(objeto).then(function(){
                        $scope.progreso++;
                        crearCodigo();
                    }).catch(function(error){
                        console.log('Error en la creación de un código', error);
                    });
                } else {
                    $scope.textoProgreso = salida.textos.modal.terminadoCreacion;
                    $scope.estiloProgreso = 'success';
                    $scope.cancelar = function(){
                        $uibModalInstance.close();
                    };
                    $scope.aceptar = function(){
                        $uibModalInstance.close();
                    };
                }
            },500);
        }
    }];
    salida.eliminar = function(){
        var modalEliminar = '<div class="modal-header"><h3>{{titulo}}</h3></div><div class="modal-body">';
        modalEliminar += '<div class="alert alert-warning" ng-show="inicial">';
        modalEliminar += '<i class="fa fa-exclamation-triangle fa-lg"></i> {{inicial}}</div>';
        modalEliminar += '<div class="alert alert-success" ng-show="exito">';
        modalEliminar += '<i class="fa fa-thumbs-up fa-lg"></i> {{exito}}</div>';
        modalEliminar += '<div class="alert alert-danger" ng-show="error">';
        modalEliminar += '<i class="fa fa-thumbs-down fa-lg"></i> {{error}}</div>';
        modalEliminar += '<div class="alert alert-info" ng-show="cuerpo">';
        modalEliminar += '{{cuerpo}}<br><uib-progressbar max="numCodigos" value="progreso" type="{{estiloProgreso}}">';
        modalEliminar += '{{progreso}} / {{numCodigos}}</uib-progressbar></div>';
        modalEliminar += '</div><div class="modal-footer">';
        modalEliminar += '<button class="btn btn-danger" type="button" ng-click="eliminar()" ng-show="botonEliminar">';
        modalEliminar += '<i class="fa fa-trash"></i> {{botonEliminar}}</button>';
        modalEliminar += '<button class="btn btn-primary" type="button" ng-click="cancelar()">';
        modalEliminar += '<i class="fa {{iconoNoEliminar}}"></i> {{botonNoEliminar}}</button></div>';
        salida.modalCodigo = $uibModal.open({
            template: modalEliminar,
            controller: modalEliminaCodigos,
            windowClass: 'modal-elimina-codigos',
            backdrop: 'static',
            keyboard: false
        });
        salida.modalCodigo.result.then(function(){
            $scope.gridApi.selection.clearSelectedRows();
            salida.estadoEditar = true;
            salida.estadoEliminar = true;
            salida.estadoExportar = true;
        });
    };
    var modalEliminaCodigos = ['$scope', '$uibModalInstance', '$timeout', function($scope, $uibModalInstance, $timeout){
        var aBorrar = salida.filasSeleccionadas;
        var todosErrores = '';
        $scope.titulo = salida.textos.modal.tituloEliminar;
        $scope.inicial = salida.textos.modal.cuerpoEliminar.replace(/XX/, salida.numFilasSeleccionadas);
        $scope.botonEliminar = salida.textos.modal.botonEliminar;
        $scope.botonNoEliminar = salida.textos.modal.botonNoEliminar;
        $scope.iconoNoEliminar = "fa-th";
        $scope.numCodigos = salida.numFilasSeleccionadas;
        $scope.cancelar = function(){
            $uibModalInstance.close();
        };
        $scope.eliminar = function(){
            $scope.botonEliminar = null;
            $scope.inicial = null;
            $scope.progreso = 0;
            $scope.cuerpo = salida.textos.modal.cuerpoProgreso;
            eliminaCodigos();
        };
        function eliminaCodigos() {
            $timeout(function(){
                if ($scope.progreso < salida.numFilasSeleccionadas) {
                    firebase.database().ref(salida.rutaDB+aBorrar[$scope.progreso].codigo).remove().then(function(){
                        $scope.progreso++;
                        eliminaCodigos();
                    }).catch(function(error){
                        todosErrores += error;
                        eliminaCodigos();
                    });
                } else {
                    $scope.cuerpo = null;
                    $scope.botonNoEliminar = salida.textos.modal.botonCerrar;
                    $scope.iconoNoEliminar = "fa-check";
                    if (todosErrores.length > 0) {
                        $scope.error = salida.textos.modal.cuerpoError;
                        console.log(todosErrores);
                    } else {
                        $scope.exito = salida.textos.modal.cuerpoExito;
                    }
                }
            },500);
        }
    }];
    salida.editar = function(){
        salida.modalCodigo = $uibModal.open({
            templateUrl: 'app/components/codigos/modalCodigos.html',
            controller: modalEditaCodigos,
            windowClass: 'modal-codigos',
            backdrop: 'static',
            keyboard: false
        });
        salida.modalCodigo.result.then(function(){
            $scope.gridApi.selection.clearSelectedRows();
            salida.estadoEditar = true;
            salida.estadoEliminar = true;
            salida.estadoExportar = true;
        });
    };
    var modalEditaCodigos = ['$scope', '$uibModalInstance', '$timeout', 'uibDateParser', function($scope, $uibModalInstance, $timeout, uibDateParser){
        $scope.codigosEditar = salida.numFilasSeleccionadas;
        $scope.titulo = salida.textos.modal.tituloEditar.replace(/XX/, salida.numFilasSeleccionadas);
        $scope.instrucciones = salida.textos.modal.instruccionesEditar;
        $scope.textoCodigosEditar = salida.textos.modal.textoCodigosEditar;
        $scope.textos = salida.textos.modal;
        var fecha = salida.filasSeleccionadas[0].validez;
        $scope.identificador = salida.filasSeleccionadas[0].identificador;
        $scope.observaciones = salida.filasSeleccionadas[0].observaciones;
        angular.forEach(salida.filasSeleccionadas, function(valor,llave){
            fecha = (fecha != valor.validez)?'':fecha;
            $scope.identificador = ($scope.identificador != valor.identificador)?'*':$scope.identificador;
            $scope.observaciones = ($scope.observaciones != valor.observaciones)?'*':$scope.observaciones;
        });
        $scope.fechaValidez = new Date(fecha);
        $scope.abrirFecha = function(){
            $scope.fechaAbierto = true;
        };
        $scope.valido = function() {
            if ($scope.fechaValidez.length < 4 || $scope.identificador.length < 4) {
                return true;
            } else {
                return false;
            }
        };
        $scope.cancelar = function(){
            $uibModalInstance.close();
        };
        $scope.aceptar = function(){
            $scope.maxCodigos = salida. numFilasSeleccionadas;
            if ($scope.fechaValidez && $scope.identificador) {
                $scope.cancelar = null;
                $scope.aceptar = null;
                $scope.textoProgreso = salida.textos.modal.progresoEdicion;
                $scope.verProgreso = true;
                $scope.progreso = 0;
                crearCodigo();
            }
        };
        function crearCodigo() {
            $timeout(function(){
                if ($scope.progreso < salida.numFilasSeleccionadas) {
                    var objeto = {
                        'identificador': $scope.identificador,
                        'fechaValidez': $scope.fechaValidez.toJSON(),
                        'observaciones': $scope.observaciones
                    };
                    var codigo = salida.filasSeleccionadas[$scope.progreso].codigo;
                    firebase.database().ref(salida.rutaDB+codigo).update(objeto).then(function(){
                        $scope.progreso++;
                        crearCodigo();
                    }).catch(function(error){
                        console.log('Error en la creación de un código', error);
                    });
                } else {
                    $scope.textoProgreso = salida.textos.modal.terminadoEdicion;
                    $scope.estiloProgreso = 'success';
                    $scope.cancelar = function(){
                        $uibModalInstance.close();
                    };
                    $scope.aceptar = function(){
                        $uibModalInstance.close();
                    };
                }
            },500);
        }
    }];
    salida.exportar = function(){
        var exportHref = Excel.tableToExcel('aExcel','Códigos');
        var a = document.createElement('a');
        a.href = exportHref;
        a.download = 'codigos.xls';
        a.click();
    };
}]);