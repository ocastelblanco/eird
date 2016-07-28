/* global angular idioma firebase */
var entradas = angular.module('entradas', []);
entradas.controller('adminEntradas', ['i18nService', 'cargaInterfaz', '$scope', '$location', '$uibModal', '$rootScope', '$timeout', function(i18nService, cargaInterfaz, $scope, $location, $uibModal, $rootScope, $timeout){
    //console.log('adminEntradas cargado');
    var rutaDB = 'entradas/';
    var salida = this;
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
        columnDefs: [
                {name: 'id', visible: false},
                {name: 'titulo'},
                {name: 'categoria'},
                {name: 'subcategoria'},
                {name: 'fecha'},
                {name: 'estado'}
        ]
    };
    salida.estadoEditar = true;
    salida.estadoEliminar = true;
    salida.numFilasSeleccionadas = 0;
    i18nService.setCurrentLang(idioma);
    cargaInterfaz.textos().then(function(resp){
        salida.titulosTabla = resp.contenido.entradas.encabezadoTablaDatos;
        salida.datosTabla.columnDefs = [
            {name: 'id', visible: false},
            {name: 'titulo', displayName: salida.titulosTabla.nomEntradas, enableColumnMenu: false, width: '30%'},
            {name: 'categoria', displayName: salida.titulosTabla.categoria, enableColumnMenu: false},
            {name: 'subcategoria', displayName: salida.titulosTabla.subcategoria, enableColumnMenu: false},
            {name: 'fecha', displayName: salida.titulosTabla.fecha, enableColumnMenu: false},
            {name: 'estado', displayName: salida.titulosTabla.estado, enableColumnMenu: false}
        ];
        cargaDatosTabla();
    });
    function cargaDatosTabla(){
        firebase.database().ref(rutaDB).once('value').then(function(snapshot) {
            $timeout(function(){salida.datosTabla.data = cambiaDatos(snapshot.val())}, 1000);
        });
    }
    function cambiaDatos(data) {
        var respuesta = [];
        angular.forEach(data, function(valor, llave){
            if (data[llave].estado) {
                data[llave].estado = salida.titulosTabla.estados[valor.estado];
                data[llave].id = llave;
                data[llave].fecha = data[llave].fecha.substr(0, 10);
                respuesta.push(data[llave]);
            }
        });
        return respuesta;
    }
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
    salida.activaBotones = function() {
        if (salida.numFilasSeleccionadas == 1) {
            salida.estadoEditar = false;
            salida.estadoEliminar = false;
        } else if (salida.numFilasSeleccionadas > 1) {
            salida.estadoEditar = true;
            salida.estadoEliminar = false;
        } else if (salida.numFilasSeleccionadas == 0) {
            salida.estadoEditar = true;
            salida.estadoEliminar = true;
        }
    };
    // Detecta las acciones de los botones de acción
    salida.nuevaEntrada = function() {
        var seccion = $location.path().split('/')[1];
        $location.path('/'+seccion+'/editarEntrada');
    };
    salida.editarEntrada = function() {
        var seccion = $location.path().split('/')[1];
        var pos = $location.search('id', salida.filasSeleccionadas[0].id);
        pos.path('/'+seccion+'/editarEntrada');
    };
    salida.eliminarEntrada = function() {
        var aBorrar = [];
        angular.forEach(salida.filasSeleccionadas, function(value, key) {
            aBorrar.push(value.id);
        });
        salida.modalInstance = $uibModal.open({
            templateUrl: 'app/shared/modal.html',
            controller: 'modalEliminaEntradas',
            backdrop: 'static',
            keyboard: false
        });
        $rootScope.$on('eliminarEntrada', function(evento, resp){
            eliminaFirebase(0);
        });
        salida.modalInstance.result.then(function(vModal){
            cargaDatosTabla();
        });
        function eliminaFirebase(llave) {
            var publicacion = firebase.database().ref(rutaDB+aBorrar[llave]);
            publicacion.remove().then(function(){
                firebase.storage().ref(aBorrar[llave]).delete();
                if (llave < aBorrar.length-1) {
                    llave++;
                    eliminaFirebase(llave);
                } else {
                    $timeout(function(){
                        $rootScope.$emit('entradaEliminada', true);
                    }, 1000);
                }
            }).catch(function(error){
                $timeout(function(){
                    $rootScope.$emit('entradaEliminada', false);
                }, 1000);
            });
        }
    };
}]);
// Controlador para la ventana modal de Eliminar Entrada
entradas.controller('modalEliminaEntradas', ['$scope', 'cargaInterfaz', '$uibModalInstance', '$rootScope',
                                        function($scope, cargaInterfaz, $uibModalInstance, $rootScope){
    cargaInterfaz.textos().then(function(resp){
        var textos = resp.contenido.entradas.modalEliminaEntradas;
        $scope.titulo = textos.titulo1;
        $scope.cuerpo = {
            'progreso': {
                'invisible': true
            },
            'contenido': '<div class="alert alert-danger" role="alert"><i class="fa fa-lg '+textos.contenido1.icono+'"></i> '+textos.contenido1.texto+'</div>'
        };
        $scope.footer = {
            'boton01': {
                'invisible': false,
                'texto': textos.boton01.texto,
                'estilo': 'btn-danger',
                'icono': {
                    'invisible': false,
                    'estilo': textos.boton01.icono
                }
            },
            'boton02': {
                'invisible': false,
                'texto': textos.boton02.texto,
                'estilo': 'btn-primary',
                'icono': {
                    'invisible': false,
                    'estilo': textos.boton02.icono
                }
            },
            'boton03': {
                'invisible': true
            }
        };
        $scope.boton01 = function() {
            $rootScope.$emit('eliminarEntrada');
            $scope.titulo = textos.titulo2;
            $scope.cuerpo = {
                'progreso': {
                    'invisible': false,
                    'valor': 100
                },
                'contenido': ''
            };
            $scope.footer = {
                'boton01': {
                    'invisible': true
                },
                'boton02': {
                    'invisible': true
                },
                'boton03': {
                    'invisible': true
                }
            };
        };
        $scope.boton02 = function() {
            $uibModalInstance.dismiss();
        };
        $rootScope.$on('entradaEliminada', function(event, exito){
            $scope.boton01 = null;
            $scope.boton02 = null;
            $scope.boton03 = null;
            if (exito) {
                $scope.titulo = textos.titulo3;
                $scope.cuerpo = {
                    'progreso': {
                        'invisible': true
                    },
                    'contenido': '<i class="fa fa-lg '+textos.contenido3.icono+'"></i> '+textos.contenido3.texto
                };
                $scope.footer = {
                    'boton01': {
                        'invisible': false,
                        'estilo': 'btn-primary',
                        'texto': textos.botonFinal.texto,
                        'icono': {
                            'invisible': false,
                            'estilo': textos.botonFinal.icono
                        }
                    },
                    'boton02': {
                        'invisible': true
                    },
                    'boton03': {
                        'invisible': true
                    }
                };
                $scope.boton01 = function() {
                    $uibModalInstance.close('cerrarModal');
                };
            } else {
                $scope.titulo = textos.tituloError;
                $scope.cuerpo = {
                    'progreso': {
                        'invisible': true
                    },
                    'contenido': '<div class="alert alert-warning" role="alert"><i class="fa fa-lg '+textos.contenidoError.icono+'"></i> '+textos.contenidoError.texto+'</div>'
                };
                $scope.footer = {
                    'boton01': {
                        'invisible': false,
                        'estilo': 'btn-primary',
                        'texto': textos.botonError,
                        'icono': {
                            'invisible': true
                        }
                    },
                    'boton02': {
                        'invisible': true
                    },
                    'boton03': {
                        'invisible': true
                    }
                };
                $scope.boton01 = function() {
                    $uibModalInstance.dismiss();
                };
            }
        });
    });
}]);