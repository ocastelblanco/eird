/* global angular idioma rutaMedios */
var entradaID;
var editarEntradas = angular.module('editarEntradas', ['ngSanitize']);
editarEntradas.controller('editarEntradas',['$uibModal','$location','$http','$rootScope','$timeout','$route','obtieneMetada','$sce',function($uibModal,$location,$http,$rootScope,$timeout,$route,obtieneMetada,$sce){
    var salida = this;
    salida.datosPOST = {};
    salida.PC = [];
    salida.medios = [];
    // Cargar información cuando ya existe un ID (se editó la entrada)
    var location = $location.search();
    if (location.id) {
        entradaID = location.id;
        salida.datosPOST.id = location.id;
        salida.datosPOST.accion = 'listarEntrada';
        $http.post('php/entradas.php', salida.datosPOST).then(function(resp){
            salida.tituloEntrada = resp.data.titulo;
            salida.textoEntrada = resp.data.texto;
            salida.fechaEntrada = resp.data.fecha;
            salida.numCat = resp.data.categoria;
            salida.cambiaCat(salida.numCat, resp.data.subcategoria);
            salida.cambiaSub(resp.data.subcategoria);
            salida.PC = resp.data.palabrasClave?resp.data.palabrasClave:[];
            salida.medios = resp.data.medios?resp.data.medios:[];
        });
    }
    salida.tinymceOptions = {
        selector: 'textarea',
        menubar: false,
        toolbar_items_size: 'small',
        language: idioma,
        min_height: 350,
        schema: 'html5',
        element_format : 'html',
        entity_encoding : 'raw',
        invalid_styles: {'*': '*'},
        valid_elements : '-a[href],-strong/b,-div[align],br,-p,-h1,-h2,ol,ul,li',
        valid_children : '-h1[strong],-h2[strong]',
        style_formats: [
            {title: 'Título', block: 'h1'},
            {title: 'Subtítulo', block: 'h2'},
            {title: 'Párrafo', block: 'p'}
        ],
        plugins: [
            "code paste"
        ],
        toolbar1: "cut copy paste | undo redo | removeformat bold italic underline | bullist numlist | alignleft aligncenter alignright alignjustify | styleselect code"
    };
    // Funciones disponibles para los botones de acción
    salida.guardaCambios = function() {
        salida.modalInstance = $uibModal.open({
            templateUrl: 'app/shared/modal.html',
            controller: 'modalGuardarEntrada',
            backdrop: 'static'
        });
        if (entradaID) {salida.datosPOST.id = entradaID;}
        salida.datosPOST.accion = 'guardar';
        salida.datosPOST.titulo = salida.tituloEntrada;
        salida.datosPOST.texto = salida.textoEntrada;
        salida.datosPOST.palabrasClave = salida.PC;
        salida.datosPOST.medios = salida.medios;
        // Y todos los demás datos necesarios, como Categoría, subcategoría y palabras clave.
        $http.post('php/entradas.php', salida.datosPOST).then(function(resp){
            $timeout(function(){
                salida.datosPOST.accion = 'listarEntrada';
                $http.post('php/entradas.php', salida.datosPOST).then(function(resp){
                    salida.fechaEntrada = resp.data.fecha;
                    salida.datosPOST.accion = null;
                });
                $rootScope.$emit('entradaGuardada', [resp.data,salida.datosPOST]);
            }, 1000);
            entradaID = resp.data.id;
            salida.datosPOST.id = entradaID; // Esto es para activar el botón Eliminar entrada
            $location.search('id', entradaID);
        });
        salida.modalInstance.result.then(function(vModal){
            if (vModal == 'cancelarEdicion') {
                cancelarEdicion();
            }
            if (vModal == 'nuevaEdicion') {
                var seccion = $location.path().split('/')[1];
                var pos = $location.search('id', null);
                pos.path('/'+seccion+'/editarEntrada');
                entradaID = null;
                $route.reload();
            }
        });
    };
    salida.cancelaEdicion = function() {
        salida.modalInstance = $uibModal.open({
            templateUrl: 'app/shared/modal.html',
            controller: 'modalCancelarEdicion'
        });
        salida.modalInstance.result.then(function(vModal){
            if (vModal == 'cancelarEdicion') {
                cancelarEdicion();
            }
        });
    };
    salida.eliminaEntrada = function() {
        if (entradaID) {
            salida.datosPOST.id = entradaID;
            salida.modalInstance = $uibModal.open({
                templateUrl: 'app/shared/modal.html',
                controller: 'modalEliminarEntrada',
                backdrop: 'static',
                keyboard: false
            });
        }
        $rootScope.$on('eliminarEntrada', function(evento, resp){
            salida.datosPOST.accion = "eliminar";
            $http.post('php/entradas.php', salida.datosPOST).then(function(resp){
                $timeout(function(){
                    $rootScope.$emit('entradaEliminada', [resp.data,salida.datosPOST]);
                }, 1000);
            });
        });
        salida.modalInstance.result.then(function(vModal){
            // Volvemos al listado de entradas luego de confirmar el cierre.
            if (vModal == 'cancelarEdicion') {
                cancelarEdicion();
            }
        });
    };
    function cancelarEdicion(){
        $location.path('/entradas');
    }
    // Funciones disponibles para los páneles de categorias/subcategorias y palabras clave
    salida.cat = true;
    obtieneMetada.categorias().then(function(resp){
        salida.categorias = resp;
    });
    salida.cambiaCat = function(valor, miSub) {
        salida.datosPOST.categoria = valor;
        salida.numSub = miSub;
        obtieneMetada.subcategorias(valor).then(function(resp){
            salida.subcategorias = resp;
        });
        obtieneMetada.palabrasClave(valor).then(function(resp){
            // Elimina palabras clave repetidas
            var respuesta = [];
            angular.forEach(resp, function(valor, llave){
                var existente = false;
                angular.forEach(salida.PC, function(valorPC, llavePC){
                    if (valor == valorPC) {existente = true;}
                });
                if (!existente) {respuesta.push(valor);}
            });
            salida.palabrasClave = respuesta;
        });
    };
    salida.cambiaSub = function(valor) {
        salida.datosPOST.subcategoria = valor;
    };
    salida.nuevaPClave = function(palabra) {
      salida.PC.push(palabra);
      salida.nuevaPC = "";
    };
    salida.existentePClave = function(palabra, index) {
      salida.PC.push(palabra);
      salida.palabrasClave.splice(index, 1);
    };
    salida.eliminaPClave = function(palabra, index) {
      salida.palabrasClave.push(palabra);
      salida.PC.splice(index, 1);
    };
    salida.buscaEnter = function(evento) {
        if (evento.code == "Enter") {
            salida.nuevaPClave(salida.nuevaPC);
        }
    };
    // Funciones y variables disponibles para la carga de elementos multimedia
    salida.abreThumb = function(medio) {
        var head = '<div class="modal-header"><button type="button" class="close" aria-label="Close"><span aria-hidden="true" ng-click="cancel()">&times;</span></button></div>';
        var body = '<div class="modal-body">';
        var footer = '</div><div class="modal-footer"><p>';
        var cuerpoMedio;
        if (medio.tipo == 0) {
            cuerpoMedio = '<img src="'+rutaMedios+medio.ruta+'">';
        } else if (medio.tipo == 1) {
            cuerpoMedio = '<div class="contenedor"><img src="'+rutaMedios+medio.thumb+'"><audio src="'+rutaMedios+medio.ruta+'" controls></audio></div>';
        } else if (medio.tipo == 2) {
            cuerpoMedio = '<video src="'+rutaMedios+medio.ruta+'" poster="'+rutaMedios+medio.thumb+'" controls></video>';
        }
        var templateMedio = head+body+cuerpoMedio+footer+medio.pie+'</p></div>';
        salida.modalInstance = $uibModal.open({
            template: templateMedio,
            size: 'lg',
            windowClass: 'modal-medios',
            controller: 'modalVerMedio'
        });
    };
    salida.rutaThumb = function(medio) {
        return (medio.tipo)?rutaMedios+medio.thumb:rutaMedios+medio.ruta;
    };
    salida.abrirCarga = function(){
        salida.modalInstance = $uibModal.open({
            templateUrl: 'app/shared/modalUpload.html',
            controller: 'modalCargarMedios',
            size: 'lg',
            windowClass: 'modal-cargamedios',
            backdrop: 'static',
            keyboard: 'false'
        });
        salida.modalInstance.result.then(function(recienCargados){
            angular.forEach(recienCargados,function(valor,llave){
                salida.medios.push(valor);
            });
            salida.guardaCambios();
        });
    };
    salida.eliminarMedio = function(index){
        salida.medioBorrar = index;
        salida.modalInstance = $uibModal.open({
            templateUrl: 'app/shared/modalConfirmar.html',
            windowClass: 'modal-eliminamedios',
            controller: modalEliminarMedios,
            backdrop: 'static',
            keyboard: false
        });
        salida.modalInstance.result.then(function(vModal){
            if (vModal == 'cerrarYguardar') {
                salida.guardaCambios();
            }
        });
    };
    var modalEliminarMedios = ['$scope', 'cargaInterfaz', '$uibModalInstance', function($scope, cargaInterfaz, $uibModalInstance){
        var textos;
        cargaInterfaz.textos().then(function(resp){
            textos = resp.contenido.editarEntrada.elementosMultimedia.modalConfirmarEliminar;
            $scope.titulo = textos.titulo;
            $scope.cuerpo = {
                'icono': {
                    'invisible': false,
                    'icono': textos.cuerpo.icono
                },
                'texto': textos.cuerpo.texto,
                'estilo': 'alert-warning'
            };
            $scope.boton01 = {
                'invisible': false,
                'estilo': 'btn-primary',
                'icono': textos.botonCancelar.icono,
                'texto':textos.botonCancelar.texto
            };
            $scope.boton02 = {
                'invisible': false,
                'estilo': 'btn-danger',
                'icono': textos.botonEliminar.icono,
                'texto':textos.botonEliminar.texto
            };
        });
        $scope.botonCerrar = function(){$uibModalInstance.dismiss();};
        $scope.boton1 = function(){$uibModalInstance.dismiss();};
        $scope.boton2 = function(){
            $scope.titulo = textos.proceso;
            $scope.proceso = true;
            $scope.boton01 = {'invisible': true};
            $scope.boton02 = {'invisible': true};
            $scope.botonCerrar = {'invisible': true};
            var post = {'accion': 'eliminar','id': entradaID, 'medio': salida.medioBorrar};
            $http.post('php/eliminaMedios.php', post).then(function(resp){
                $scope.boton01 = {
                    'invisible': false,
                    'estilo': 'btn-primary',
                    'icono': textos.botonCerrar.icono,
                    'texto': textos.botonCerrar.texto
                };
                $scope.proceso = false;
                if (resp.data.respuesta) {
                    $timeout(function(){
                        salida.medios.splice(salida.medioBorrar,1);
                        $scope.titulo = textos.terminado;
                        $scope.cuerpo = {
                            'icono': {
                                'invisible': false,
                                'icono': 'fa-thumbs-up fa-lg'
                            },
                            'texto': textos.cuerpoTerminado,
                            'estilo': 'alert-success'
                        };
                        $scope.boton1 = function(){$uibModalInstance.close('cerrarYguardar');};
                    },500);
                } else {
                    $scope.titulo = textos.tituloError;
                    $scope.cuerpo = {
                        'icono': {
                            'invisible': false,
                            'icono': 'fa-ban fa-2x'
                        },
                        'texto': resp.data.mensaje,
                        'estilo': 'alert-danger'
                    };
                }
            });
        };
    }];
}]);
// Controlador para la ventana modal de cargar medios
editarEntradas.controller('modalCargarMedios', ['$scope', 'cargaInterfaz', '$uibModalInstance', '$rootScope','Upload', '$timeout', function($scope, cargaInterfaz, $uibModalInstance, $rootScope, Upload, $timeout){
    var metadata = [];
    var tipos = {'image/jpeg': 0, 'audio/mp3': 1, 'video/mp4': 2};
    $scope.misArchivos = [];
    $scope.medioThumb = [];
    $scope.pies = [];
    cargaInterfaz.textos().then(function(resp){
        var textos = resp.contenido.editarEntrada.modalCargarMedios;
        $scope.titulo = textos.titulo;
        $scope.cuerpo = {
            'progreso': {'invisible': true},
            'instrucciones': textos.instrucciones,
            'noCompatible': textos.noCompatible,
            'miniInstrucciones': textos.miniInstrucciones,
            'botonSubirThumb': textos.botonSubirThumb,
            'botonEliminar': textos.botonEliminar,
            'textareaPlaceholder': textos.textareaPlaceholder
        };
        $scope.footer = {
            'boton01': {'invisible': true},
            'boton02': {
                'invisible': false,
                'texto': textos.boton02.texto,
                'estilo': 'btn-danger',
                'icono': {
                    'invisible': false,
                    'estilo': textos.boton02.icono
                }
            }
        };
        $scope.boton02 = function() {
            $uibModalInstance.dismiss('cancel');
        };
        $scope.$watch('archivos', function() {
            $scope.upload($scope.archivos);
        });
        $scope.tarjetaUpVisible = true;
        $scope.upload = function (archivos) {
            if (archivos && archivos.length) {
                angular.forEach(archivos, function(valor, llave){$scope.misArchivos.push(valor);});
                $scope.footer = {
                    'boton01': {
                        'invisible': false,
                        'texto': textos.boton01.texto,
                        'estilo': 'btn-primary',
                        'icono': {
                            'invisible': false,
                            'estilo': textos.boton01.icono
                        }
                    },
                    'boton02': {
                        'invisible': false,
                        'texto': textos.boton02.texto,
                        'estilo': 'btn-danger',
                        'icono': {
                            'invisible': false,
                            'estilo': textos.boton02.icono
                        }
                    }
                };
                $scope.boton01 = function() {
                    cargarArchivos();
                };
                $scope.boton02 = function() {
                    archivos = [];
                    $scope.misArchivos = [];
                    $uibModalInstance.dismiss('cancel');
                };
            }
        };
        $scope.eliminarMedio = function(index) {
            $scope.misArchivos.splice(index, 1);
            $scope.medioThumb.splice(index, 1);
        };
        $scope.subirThumb = function(thumb, index){
            $scope.medioThumb[index] = thumb;
        };
        function cargarArchivos() {
            var mediosCargados = [];
            var thumbsCargados = [];
            var erroresMetadata = [];
            angular.forEach($scope.misArchivos, function(valor, llave){
                metadata[llave] = {'ruta':'','pie':'','tipo':'','thumb':''};
                metadata[llave].ruta = valor.name;
                metadata[llave].pie = ($scope.pies[llave])?$scope.pies[llave]:'';
                metadata[llave].tipo = tipos[valor.type];
                metadata[llave].thumb = ($scope.medioThumb[llave])?$scope.medioThumb[llave].name:'';
            });
            $scope.tarjetaUpVisible = false;
            $scope.progresoVisible = [];
            $scope.progresoValor = [];
            $scope.mensajeError = [];
            $scope.mensajeThumbError = [];
            $scope.mensajeExito = [];
            $scope.mensajeThumbExito = [];
            $scope.progresoThumbVisible = [];
            $scope.progresoThumbValor = [];
            // Carga primero los medios, img, audio o video.
            angular.forEach($scope.misArchivos, function(archivo, llave){
                mediosCargados[llave] = false;
                $scope.progresoVisible[llave] = true;
                $scope.progresoValor[llave] = 0;
                $timeout(function(){
                    Upload.upload({
                        url: 'php/cargaMedios.php',
                        data: {file: archivo}
                    }).then(function(resp) {
                        //console.log(resp);
                        if (resp.data.respuesta) {
                            metadata[llave].ruta = resp.data.nombreFinal;
                            $scope.mensajeExito[llave] = archivo.name + textos.mensajeExito;
                        } else {
                            $scope.mensajeError[llave] = textos.mensajeError + archivo.name + ': ' + resp.data.mensaje;
                            erroresMetadata.push(llave);
                        }
                        mediosCargados[llave] = true;
                        verificaCargas();
                    }, function(resp) {
                        $scope.mensajeError[llave] = textos.mensajeError + archivo.name + ': ' + resp.status;
                        erroresMetadata.push(llave);
                        mediosCargados[llave] = true;
                        verificaCargas();
                    }, function(evt) {
                        $scope.progresoValor[llave] = parseInt(100.0 * evt.loaded / evt.total);
                    });
                }, (llave*1000));
            });
            // Carga los tumbs que se usaron para audio o video
            angular.forEach($scope.medioThumb, function(archivo, llave){
                $scope.progresoThumbVisible[llave] = true;
                $scope.progresoThumbValor[llave] = 0;
                thumbsCargados[llave] = false;
                $timeout(function(){
                    Upload.upload({
                        url: 'php/cargaMedios.php',
                        data: {file: archivo}
                    }).then(function(resp) {
                        //console.log(resp);
                        if (resp.data.respuesta) {
                            metadata[llave].thumb = resp.data.nombreFinal;
                            $scope.mensajeThumbExito[llave] = archivo.name + textos.mensajeExito;
                        } else {
                            $scope.mensajeThumbError[llave] = textos.mensajeError + archivo.name + ': ' + resp.data.mensaje;
                            erroresMetadata.push(llave);
                        }
                        thumbsCargados[llave] = true;
                        verificaCargas();
                    }, function(resp) {
                        $scope.mensajeThumbError[llave] = textos.mensajeError + archivo.name + ': ' + resp.status;
                        thumbsCargados[llave] = true;
                        erroresMetadata.push(llave);
                        verificaCargas();
                    }, function(evt) {
                        $scope.progresoThumbValor[llave] = parseInt(100.0 * evt.loaded / evt.total);
                    });
                }, (llave*1000));
            });
            $scope.footer = {
                'boton01': {'invisible': true},
                'boton02': {'invisible': true}
            };
            function verificaCargas() {
                var todoCargado = true;
                angular.forEach(mediosCargados,function(valor,llave){if(!valor){todoCargado=false;}});
                angular.forEach(thumbsCargados,function(valor,llave){if(!valor){todoCargado=false;}});
                if(todoCargado){
                    $scope.footer.boton01 = {
                        'invisible': false,
                        'texto': textos.botonOK.texto,
                        'estilo': 'btn-primary',
                        'icono': {'invisible': true}
                    };
                    var temp = [];
                    angular.forEach(metadata,function(valor,llave){
                        var sinError = true;
                        angular.forEach(erroresMetadata,function(value,key){
                            if (llave == value){
                                sinError = false;
                            }
                        });
                        if(sinError){temp.push(valor);}
                    });
                    metadata = temp;
                    $scope.boton01 = function(){$uibModalInstance.close(metadata);};
                }
            }
        }
    });
}]);
// Controlador para la ventana modal de Ver medio
editarEntradas.controller('modalVerMedio', ['$scope', '$uibModalInstance', function ($scope, $uibModalInstance) {
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
}]);
// Controlador para la ventana modal de Eliminar Entrada
editarEntradas.controller('modalEliminarEntrada', ['$scope', 'cargaInterfaz', '$uibModalInstance', '$rootScope',
                                        function($scope, cargaInterfaz, $uibModalInstance, $rootScope){
    cargaInterfaz.textos().then(function(resp){
        var textos = resp.contenido.editarEntrada.modalEliminarEntrada;
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
        $rootScope.$on('entradaEliminada', function(event, resp){
            $scope.boton01 = null;
            $scope.boton02 = null;
            $scope.boton03 = null;
            if (resp[0].respuesta) {
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
                    $uibModalInstance.close('cancelarEdicion');
                };
            } else {
                $scope.titulo = textos.tituloError;
                $scope.cuerpo = {
                    'progreso': {
                        'invisible': true
                    },
                    'contenido': '<div class="alert alert-warning" role="alert"><i class="fa fa-lg '+textos.contenidoError.icono+'"></i> '+textos.contenidoError.texto1+'<strong>'+resp[1].titulo+'</strong>'+textos.contenidoError.texto2+'</div>'
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
// Controlador para la ventana modal de Cancelar Edición
editarEntradas.controller('modalCancelarEdicion', ['$scope', 'cargaInterfaz', '$uibModalInstance',
                                        function($scope, cargaInterfaz, $uibModalInstance){
    cargaInterfaz.textos().then(function(resp){
        var textos = resp.contenido.editarEntrada.modalCancelarEdicion;
        $scope.titulo = textos.titulo;
        $scope.cuerpo = {
            'contenido': textos.cuerpo,
            'progreso': {
                'invisible': true
            }
        };
        $scope.footer = {
            'boton01': {
                'invisible': false,
                'texto': textos.footer.boton01.texto,
                'estilo': 'btn-default',
                'icono': {
                    'invisible': false,
                    'estilo': textos.footer.boton01.icono
                }
            },
            'boton02': {
                'invisible': false,
                'texto': textos.footer.boton02.texto,
                'estilo': 'btn-primary',
                'icono': {
                    'invisible': true
                }
            },
            'boton03': {
                'invisible': true
            }
        };
    });
    $scope.boton01 = function() {
        $uibModalInstance.close('cancelarEdicion');
    };
    $scope.boton02 = function() {
        $uibModalInstance.dismiss();
    };
}]);
// Controlador para la ventana modal de Guardar Edición
editarEntradas.controller('modalGuardarEntrada', ['$scope', 'cargaInterfaz', '$uibModalInstance', '$rootScope',
                                          function($scope, cargaInterfaz, $uibModalInstance, $rootScope){
    cargaInterfaz.textos().then(function(resp){
        var textos = resp.contenido.editarEntrada.modalGuardarEntrada;
        $scope.titulo = textos.titulo1;
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
        $rootScope.$on('entradaGuardada', function(event, resp){
            if (resp[0].respuesta) {
                $scope.titulo = textos.titulo2;
                $scope.cuerpo = {
                    'progreso': {
                        'invisible': true
                    },
                    'contenido': '<div class="alert alert-success" role="alert"><i class="fa fa-lg '+textos.contenido.icono+'"></i> '+textos.contenido.texto1+'<strong>'+resp[1].titulo+'</strong>'+textos.contenido.texto2+'</div>'
                };
                $scope.footer = {
                    'boton01': {
                        'invisible': false,
                        'estilo': 'btn-default',
                        'texto': textos.boton01.texto,
                        'icono': {
                            'invisible': false,
                            'estilo': textos.boton01.icono
                        }
                    },
                    'boton02': {
                        'invisible': false,
                        'estilo': 'btn-default',
                        'texto': textos.boton02.texto,
                        'icono': {
                            'invisible': false,
                            'estilo': textos.boton02.icono
                        }
                    },
                    'boton03': {
                        'invisible': false,
                        'estilo': 'btn-default',
                        'texto': textos.boton03.texto,
                        'icono': {
                            'invisible': false,
                            'estilo': textos.boton03.icono
                        }
                    }
                };
                $scope.boton02 = function() {
                    $uibModalInstance.close('cancelarEdicion');
                };
                $scope.boton03 = function() {
                    $uibModalInstance.close('nuevaEdicion');
                };
            } else {
                $scope.titulo = textos.tituloError;
                $scope.cuerpo = {
                    'progreso': {
                        'invisible': true
                    },
                    'contenido': '<div class="alert alert-danger" role="alert"><i class="fa fa-lg '+textos.contenidoError.icono+'"></i> '+textos.contenidoError.texto1+'<strong>'+resp[1].titulo+'</strong>'+textos.contenidoError.texto2+'</div>'
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
            }
            $scope.boton01 = function() {
                $uibModalInstance.dismiss();
            };
        }); 
    });
}]);
editarEntradas.service('obtieneMetada', ['$http', function($http){
    var rutaCat = 'php/categorias.php';
    var rutaPC = 'php/palabrasclave.php';
    var obtieneMetada = {
        categorias: function() {
            var promesa = $http.get(rutaCat).then(function(resp){
                return resp.data;
            });
            return promesa;
        },
        subcategorias: function(cat) {
            var promesa = $http.get(rutaCat+'?cat='+cat).then(function(resp){
                return resp.data;
            });
            return promesa;
        },
        palabrasClave: function(cat) {
            var promesa = $http.get(rutaPC+'?cat='+cat).then(function(resp){
                return resp.data;
            });
            return promesa;
        }
    };
    return obtieneMetada;
}]);