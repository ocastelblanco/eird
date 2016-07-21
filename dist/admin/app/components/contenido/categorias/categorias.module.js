/* global angular idioma */
var categorias = angular.module('categorias', []);
categorias.controller('adminCategorias', ['$http', 'i18nService', 'cargaInterfaz', '$scope', '$uibModal', '$timeout', function($http, i18nService, cargaInterfaz, $scope, $uibModal, $timeout){
    //console.log('Publicar cargado');
    var salida = this;
    salida.filaSeleccionada = [];
    salida.datosTabla = {
        enableRowSelection: true,
        enableSelectAll: true,
        enableFiltering: true,
        multiSelect: false,
        selectionRowHeaderWidth: 35,
        rowHeight: 35,
        showGridFooter:true,
        paginationPageSizes: [10, 20, 50],
        paginationPageSize: 10,
        columnDefs: [
                {name: 'id', visible: false},
                {name: 'categoria'},
                {name: 'subcategoria'},
                {name: 'palabrasclave'}
        ]
    };
    salida.estadoEditar = true;
    i18nService.setCurrentLang(idioma);
    cargaInterfaz.textos().then(function(resp){
        salida.modal = resp.contenido.categorias.modal;
        salida.modalEditarCategoria = resp.contenido.categorias.modalEditar;
        salida.titulosTabla = resp.contenido.categorias.titulosTabla;
        salida.datosTabla.columnDefs = [
            {name: 'id', visible: false},
            {name: 'categoria', displayName: salida.titulosTabla.categoria, width: '20%'},
            {name: 'subcategoria', displayName: salida.titulosTabla.subcategoria, width: '40%'},
            {name: 'palabrasclave', displayName: salida.titulosTabla.palabrasclave, width: '40%'}
        ];
        cargaDatosTabla();
    });
    function cargaDatosTabla(){
        $http.get('php/categorias.php?todo=true').then(function(resp){
            var categorias = resp.data;
            $http.get('php/palabrasclave.php?todo=true').then(function(resp){
                var palabrasclave = resp.data;
                var json = [];
                var id = 0;
                angular.forEach(categorias, function(valor, llave){
                    var sub = '';
                    var pClave = '';
                    angular.forEach(categorias[llave], function(valCat, llaveCat){
                        var separador = (llaveCat < categorias[llave].length-1)?' | ':'';
                        sub += valCat+separador;
                        
                    });
                    angular.forEach(palabrasclave[llave], function(valPC, llavePC){
                        var separador = (llavePC < palabrasclave[llave].length-1)?' | ':'';
                        pClave += valPC+separador;
                        
                    });
                    json.push({'id': id, 'categoria': llave, 'subcategoria': sub, 'palabrasclave': pClave});
                    id++;
                });
                salida.datosTabla.data = json;
            });
        });
    }
    // Captura cuando el usuario selecciona una fila de la tabla
    salida.datosTabla.onRegisterApi = function(gridApi){
        $scope.gridApi = gridApi;
        gridApi.selection.on.rowSelectionChanged($scope,function(row){
            salida.filaSeleccionada = gridApi.selection.getSelectedRows();
            salida.estadoEditar = (gridApi.selection.getSelectedCount())?false:true;
        });
    };
    salida.crear = function(){
        $scope.gridApi.selection.clearSelectedRows();
        salida.estadoEditar = ($scope.gridApi.selection.getSelectedCount())?false:true;
        salida.filaSeleccionada = [{'categoria': '', 'subcategorias': '', 'palabrasclave': ''}];
        salida.editar();
    };
    salida.editar = function(){
        salida.modalInstance = $uibModal.open({
            templateUrl: 'app/shared/modalCategoria.html',
            controller: modalEditarCategoria,
            windowClass: 'modal-editacategoria',
            size: 'lg'
        });
    };
    salida.eliminar = function(){
        salida.modalInstance = $uibModal.open({
            templateUrl: 'app/shared/modal.html',
            controller: modalEliminarCategoria,
            backdrop: 'static',
            keyboard: false
        });
    };
    salida.eliminarCategoria = function() {
        var datosPost = {'accion': 'eliminar', 'categoria': salida.filaSeleccionada[0].categoria};
        $http.post('php/eliminaCategoria.php', datosPost).then(function(resp){
            if (resp.data.respuesta) {
                salida.datosTabla.data.splice(salida.filaSeleccionada[0].id, 1);
                angular.forEach(salida.datosTabla.data, function(valor, llave){
                    salida.datosTabla.data[llave].id = llave;
                });
                $timeout(function(){
                    salida.cierraEliminar(true);
                }, 500);
            } else {
                $timeout(function(){
                    salida.cierraEliminar(false);
                }, 500);
            }
        });
    };
    salida.guardarCategoria = function(id, cat, sub, pc){
        var datosTemp = salida.datosTabla.data;
        var subc = '';
        var pClave = '';
        angular.forEach(sub, function(valCat, llaveCat){
            var separador = (llaveCat < sub.length-1)?' | ':'';
            subc += valCat+separador;
        });
        angular.forEach(pc, function(valPC, llavePC){
            var separador = (llavePC < pc.length-1)?' | ':'';
            pClave += valPC+separador;
        });
        if (id == null) {
            id = datosTemp.length;
            datosTemp.push({'id': id, 'categoria': cat, 'subcategoria': subc, 'palabrasclave': pClave});
        }
        var archivoCategorias = {};
        var archivoPalabrasclave = {};
        angular.forEach(datosTemp, function(valor, llave) {
            if(id == llave) {
                archivoCategorias[cat] = sub;
                archivoPalabrasclave[cat] = pc;
            } else {
                archivoCategorias[valor.categoria] = valor.subcategoria.split(' | ');
                archivoPalabrasclave[valor.categoria] = valor.palabrasclave.split(' | ');
            }
        });
        var salidaPOST = {'categorias': archivoCategorias, 'palabrasclave': archivoPalabrasclave};
        $http.post('php/guardarCategorias.php', salidaPOST).then(function(resp){
            $timeout(function(){
                salida.exitoCambios(resp.data.respuesta);
            },500);
            if (resp.data.respuesta) {
                cargaDatosTabla();
            }
        });
    };
    var modalEliminarCategoria = ['$uibModalInstance', '$scope', function($uibModalInstance, $scope){
        salida.eliminarAdvertencia = '<div class="alert alert-warning" role="alert"><i class="fa fa-exclamation-triangle fa-lg"></i> '+salida.modal.eliminar.cuerpo + salida.filaSeleccionada[0].categoria + '?</div>';
        salida.eliminarExito = '<div class="alert alert-success" role="alert"><i class="fa fa-thumbs-up fa-lg"></i> '+salida.modal.eliminar.cuerpoExito + '</div>';
        salida.eliminarError = '<div class="alert alert-danger" role="alert"><i class="fa fa-thumbs-down fa-lg"></i> '+salida.modal.eliminar.cuerpoError + '</div>';
        $scope.titulo = salida.modal.eliminar.titulo;
        $scope.cuerpo = {
            'progreso': {
                'invisible': true
            },
            'contenido': salida.eliminarAdvertencia
        };
        $scope.footer = {
            'boton01': {
                'invisible': false,
                'texto': salida.modal.eliminar.botonCancelar.texto,
                'estilo': 'btn-primary',
                'icono': {
                    'invisible': false,
                    'estilo': salida.modal.eliminar.botonCancelar.icono
                }
            },
            'boton02': {
                'invisible': false,
                'texto': salida.modal.eliminar.botonEliminar.texto,
                'estilo': 'btn-danger',
                'icono': {
                    'invisible': false,
                    'estilo': salida.modal.eliminar.botonEliminar.icono
                }
            },
            'boton03': {
                'invisible': true
            }
        };
        $scope.boton01 = function(){$uibModalInstance.dismiss();};
        $scope.boton02 = function(){
            $scope.titulo = salida.modal.eliminar.proceso;
            $scope.cuerpo = {
                'progreso': {
                    'invisible': false
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
            salida.eliminarCategoria();
        };
        salida.cierraEliminar = function(exito) {
            if (exito) {
                $scope.titulo = salida.modal.eliminar.final;
                $scope.cuerpo = {
                    'progreso': {
                        'invisible': true
                    },
                    'contenido': salida.eliminarExito
                };
                $scope.footer = {
                    'boton01': {
                        'invisible': false,
                        'texto': salida.modal.eliminar.botonAceptar,
                        'estilo': 'btn-primary',
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
                $scope.boton01 = function(){$uibModalInstance.dismiss();};
            } else {
                $scope.titulo = salida.modal.eliminar.error;
                $scope.cuerpo = {
                    'progreso': {
                        'invisible': true
                    },
                    'contenido': salida.eliminarError
                };
                $scope.footer = {
                    'boton01': {
                        'invisible': false,
                        'texto': salida.modal.eliminar.botonAceptar,
                        'estilo': 'btn-primary',
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
        };
    }];
    var modalEditarCategoria = ['$uibModalInstance', '$scope', function($uibModalInstance, $scope){
        $scope.proceso = false;
        $scope.paneles = true;
        $scope.verCancelar = true;
        $scope.titulo = salida.modalEditarCategoria.titulo;
        $scope.instrucciones = salida.modalEditarCategoria.instrucciones;
        $scope.instrucciones.estilo = 'alert-info';
        $scope.categoria = salida.filaSeleccionada[0].categoria;
        $scope.subcategorias = (salida.filaSeleccionada[0].subcategoria)?salida.filaSeleccionada[0].subcategoria.split(' | '):[];
        $scope.palabrasclave = (salida.filaSeleccionada[0].palabrasclave)?salida.filaSeleccionada[0].palabrasclave.split(' | '):[];
        $scope.editaCategoria = (salida.filaSeleccionada[0].categoria)?false:true;
        $scope.nomCategoria = {
            'titulo': salida.modalEditarCategoria.categoria.titulo,
            'instrucciones': salida.modalEditarCategoria.categoria.instrucciones
        };
        $scope.nomSubcategorias = salida.modalEditarCategoria.subcategorias;
        $scope.nomPalabrasclave = salida.modalEditarCategoria.palabrasclave;
        $scope.creaNuevaSub = function() {
            $scope.subcategorias.push($scope.nuevaSub);
            $scope.nuevaSub = '';
        };
        $scope.subBuscaEnter = function(evento){
            if (evento.code == "Enter") {
                $scope.creaNuevaSub();
            }
        };
        $scope.creaNuevaPC = function() {
            $scope.palabrasclave.push($scope.nuevaPC);
            $scope.nuevaPC = '';
        };
        $scope.pcBuscaEnter = function(evento){
            if (evento.code == "Enter") {
                $scope.creaNuevaPC();
            }
        };
        $scope.botonAceptar = salida.modalEditarCategoria.botonAceptar;
        $scope.botonCancelar = salida.modalEditarCategoria.botonCancelar;
        $scope.aceptarCambios = function(){
            $scope.proceso = true;
            $scope.titulo = salida.modalEditarCategoria.proceso;
            salida.guardarCategoria(salida.filaSeleccionada[0].id, $scope.categoria, $scope.subcategorias, $scope.palabrasclave);
        };
        $scope.cancelarCambios = function(){$uibModalInstance.dismiss();};
        salida.exitoCambios = function(exito){
            $scope.proceso = false;
            $scope.paneles = false;
            $scope.verCancelar = false;
            $scope.botonAceptar = salida.modalEditarCategoria.botonFinalizar;
            $scope.aceptarCambios = function(){$uibModalInstance.dismiss();};
            if (exito) {
                $scope.titulo = salida.modalEditarCategoria.exito;
                $scope.instrucciones.texto = salida.modalEditarCategoria.cuerpoExito;
                $scope.instrucciones.estilo = 'alert-success';
                $scope.instrucciones.icono = 'fa-thumbs-up';
            } else {
                $scope.titulo = salida.modalEditarCategoria.error;
                $scope.instrucciones.texto = salida.modalEditarCategoria.cuerpoError;
                $scope.instrucciones.estilo = 'alert-danger';
                $scope.instrucciones.icono = 'fa-thumbs-down';
            }
        };
    }];
}]);