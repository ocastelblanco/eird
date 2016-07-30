/* global angular idioma firebase */
var papelera = angular.module('papelera', []);
papelera.controller('adminPapelera', ['i18nService', 'cargaInterfaz', '$scope', '$rootScope', '$uibModal', '$timeout', 'preCarga', function(i18nService, cargaInterfaz, $scope, $rootScope, $uibModal, $timeout, preCarga){
    //console.log('Papelera cargado');
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
    salida.estadoRestaurar = true;
    salida.estadoEliminar = true;
    i18nService.setCurrentLang(idioma);
    cargaInterfaz.textos().then(function(resp){
        salida.textos = resp.contenido.papelera;
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
            $timeout(function(){
                salida.datosTabla.data = cambiaDatos(snapshot.val());
                preCarga(false);
            }, 1000);
        });
    }
    function cambiaDatos(data) {
        var respuesta = [];
        angular.forEach(data, function(valor, llave){
            if (data[llave] && data[llave].estado == 0) {
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
        if (salida.numFilasSeleccionadas) {
            salida.estadoRestaurar = false;
            salida.estadoEliminar = false;
        } else {
            salida.estadoRestaurar = true;
            salida.estadoEliminar = true;
        }
    };
    salida.abreModal = function(modo) {
        salida.modo = modo;
        salida.modalInstance = $uibModal.open({
            templateUrl: 'app/shared/modal.html',
            controller: modalPapelera,
            backdrop: 'static',
            keyboard: false
        });
    };
    salida.restaurarEntrada = function(){
        var exitoRestauracion = [];
        var errorRestauracion = [];
        restaura(0);
        function restaura(llave){
            var entrada = salida.filasSeleccionadas[llave].id;
            var restauracion = firebase.database().ref(rutaDB+entrada);
            restauracion.update({'estado':2}).then(function(){
                exitoRestauracion.push(salida.filasSeleccionadas[llave].titulo);
                avanza();
            }).catch(function(error){
                errorRestauracion.push(salida.filasSeleccionadas[llave].titulo+': '+error);
                avanza();
            });
            function avanza(){
                if (llave < salida.filasSeleccionadas.length-1) {
                    llave++;
                    restaura(llave);
                } else {
                    if (errorRestauracion.length) {
                        salida.cerrarModal(false, exitoRestauracion, errorRestauracion);
                    } else {
                        salida.cerrarModal(true, exitoRestauracion, errorRestauracion);
                    }
                    cargaDatosTabla();
                }
            }
        }
    };
    salida.eliminarEntrada = function(){
        var exitoEliminacion = [];
        var errorEliminacion = [];
        elimina(0);
        function elimina(llave){
            var nomEntrada = salida.filasSeleccionadas[llave].titulo;
            var entrada = salida.filasSeleccionadas[llave].id;
            var medios = salida.filasSeleccionadas[llave].medios;
            var eliminacion = firebase.database().ref(rutaDB+entrada);
            eliminacion.remove().then(function(){
                if (medios && medios.length) {
                    borraMedio(0);
                }
            }).catch(function(){
                errorEliminacion.push(nomEntrada);
                avanza();
            });
            function borraMedio(clave) {
                var medio = medios[clave].nombre;
                firebase.storage().ref(entrada+'/'+medio).delete().then(function(){
                    if (medios[clave].nombreThumb) {
                        firebase.storage().ref(entrada+'/'+medios[clave].nombreThumb).delete().then(function(){
                            avanzaMedio();
                        }).catch(function(error){
                            errorEliminacion.push(nomEntrada+': no se pudo borrar '+medios[clave].nombreThumb+', '+error);
                            avanzaMedio();
                        });
                    } else {
                        avanzaMedio();
                    }
                }).catch(function(error){
                    errorEliminacion.push(nomEntrada+': no se pudo borrar '+medio+', '+error);
                    avanzaMedio();
                });
                function avanzaMedio() {
                    if (clave < medios.length-1) {
                        clave++;
                        borraMedio(clave);
                    } else {
                        exitoEliminacion.push(nomEntrada);
                        avanza();
                    }
                }
            }
            function avanza(){
                if (llave < salida.filasSeleccionadas.length-1) {
                    llave++;
                    elimina(llave);
                } else {
                    if (errorEliminacion.length) {
                        salida.cerrarModal(false, exitoEliminacion, errorEliminacion);
                    } else {
                        salida.cerrarModal(true, exitoEliminacion, errorEliminacion);
                    }
                    cargaDatosTabla();
                }
            }
        }
    };
    var modalPapelera = ['$uibModalInstance', '$scope', '$rootScope', function($uibModalInstance, $scope, $rootScope){
        var entradas = '';
        angular.forEach(salida.filasSeleccionadas, function(valor, llave) {
            entradas += '<li>'+valor.titulo+'</li>';
        });
        var confirmacion = '<div class="alert '+salida.textos[salida.modo].confirmacion.estilo;
        confirmacion += '" role="alert"><i class="fa fa-lg fa-exclamation-triangle"></i> ';
        confirmacion += salida.textos[salida.modo].confirmacion.contenido+'<ol>'+entradas+'</ol>';
        confirmacion += salida.textos[salida.modo].confirmacion.pie+'</div>';
        $scope.titulo = salida.textos[salida.modo].confirmacion.titulo;
        $scope.cuerpo = {
            'progreso': {
                'invisible': true
            },
            'contenido': confirmacion
        };
        $scope.footer = {
            'boton01': {
                'invisible': false,
                'texto': salida.textos[salida.modo].confirmacion.botonAceptar.texto,
                'estilo': salida.textos[salida.modo].confirmacion.botonAceptar.estilo,
                'icono': {
                    'invisible': false,
                    'estilo': salida.textos[salida.modo].confirmacion.botonAceptar.icono
                }
            },
            'boton02': {
                'invisible': false,
                'texto': salida.textos[salida.modo].confirmacion.botonCancelar.texto,
                'estilo': salida.textos[salida.modo].confirmacion.botonCancelar.estilo,
                'icono': {
                    'invisible': false,
                    'estilo': salida.textos[salida.modo].confirmacion.botonCancelar.icono
                }
            },
            'boton03': {
                'invisible': true
            }
        };
        $scope.boton01 = function() {
            $scope.titulo = salida.textos[salida.modo].proceso;
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
            if (salida.modo == 'modalRestaurarEntrada') {salida.restaurarEntrada();}
            if (salida.modo == 'modalEliminarEntrada') {salida.eliminarEntrada();}
        };
        $scope.boton02 = function() {$uibModalInstance.dismiss();};
        salida.cerrarModal = function(exito, aciertos, errores) {
            var bien = '<ul class="fa-ul">';
            angular.forEach(aciertos, function(valor, llave) {
                bien += '<li><i class="fa-li fa fa-check"></i>'+valor+'</li>';
            });
            bien += '</ul>';
            var mal = '<ul class="fa-ul">';
            angular.forEach(errores, function(valor, llave) {
                mal += '<li><i class="fa-li fa fa-times"></i>'+valor+'</li>';
            });
            mal += '</ul>';
            $scope.boton01 = null;
            $scope.boton02 = null;
            $scope.boton03 = null;
            if (exito) {
                $scope.titulo = salida.textos[salida.modo].exito.titulo;
                $scope.cuerpo = {
                    'progreso': {
                        'invisible': true
                    },
                    'contenido': '<div class="alert alert-success"><i class="fa fa-lg fa-thumbs-up"></i> '+salida.textos[salida.modo].exito.contenido+bien+'</div>'
                };
                $scope.footer = {
                    'boton01': {
                        'invisible': false,
                        'estilo': 'btn-primary',
                        'texto': salida.textos[salida.modo].exito.boton,
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
            } else {
                $scope.titulo = salida.textos[salida.modo].error.titulo;
                $scope.cuerpo = {
                    'progreso': {
                        'invisible': true
                    },
                    'contenido': '<div class="alert alert-warning"><i class="fa fa-lg fa-thumbs-down"></i> '+salida.textos[salida.modo].error.contenido+bien+mal+'</div>'
                };
                $scope.footer = {
                    'boton01': {
                        'invisible': false,
                        'estilo': 'btn-primary',
                        'texto': salida.textos[salida.modo].error.boton,
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
            }
            $scope.boton01 = function() {$uibModalInstance.dismiss();};
        };
    }];
}]);