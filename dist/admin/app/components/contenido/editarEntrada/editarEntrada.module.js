/* global angular idioma firebase */
var editarEntradas = angular.module('editarEntradas', ['ngSanitize']);
editarEntradas.controller('editarEntradas',['$uibModal','$location','$rootScope','$timeout','$route','obtieneMetada','$filter', 'preCarga',function($uibModal,$location,$rootScope,$timeout,$route,obtieneMetada,$filter,preCarga){
    var salida = this;
    var rutaDB = 'entradas/';
    salida.id = null;
    salida.PC = [];
    salida.medios = [];
    // Cargar información cuando ya existe un ID (se editó la entrada)
    var location = $location.search();
    if (location.id) {
        salida.id = location.id;
        firebase.database().ref(rutaDB+salida.id).once('value').then(function(resp){
            salida.tituloEntrada = resp.val().titulo;
            salida.textoEntrada = resp.val().texto;
            salida.fechaEntrada = resp.val().fecha;
            salida.numCat = resp.val().categoria;
            salida.cambiaCat(salida.numCat, resp.val().subcategoria);
            salida.cambiaSub(resp.val().subcategoria);
            salida.PC = resp.val().palabrasClave?resp.val().palabrasClave:[];
            salida.medios = resp.val().medios?resp.val().medios:[];
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
    $timeout(preCarga(false), 100);
    // Funciones disponibles para los botones de acción
    salida.guardaCambios = function() {
        salida.modalInstance = $uibModal.open({
            templateUrl: 'app/shared/modal.html',
            controller: 'modalGuardarEntrada',
            backdrop: 'static'
        });
        salida.entrada = {
            titulo: salida.tituloEntrada,
            texto: salida.textoEntrada,
            palabrasClave: salida.PC,
            medios: salida.medios,
            fecha: $filter('date')(Date.now(), 'y-MM-dd hh:mm:ss a'),
            categoria: salida.categoria,
            subcategoria: salida.subcategoria,
            estado: 2
        };
        salida.fechaEntrada = salida.entrada.fecha;
        var publicacion;
        if (salida.id) {
            publicacion = firebase.database().ref(rutaDB+salida.id).update(salida.entrada);
        } else {
            publicacion = firebase.database().ref(rutaDB).push(salida.entrada);
            salida.id = publicacion.key;
            $location.search('id', salida.id);
        }
        publicacion.then(function(){
            $timeout(function(){
                $rootScope.$emit('entradaGuardada', [true,salida.entrada]);
            }, 1500);
        }).catch(function(){
            // Error
            $timeout(function(){
                $rootScope.$emit('entradaGuardada', [false,salida.entrada]);
            }, 1500);
        });
        salida.modalInstance.result.then(function(vModal){
            if (vModal == 'cancelarEdicion') {
                cancelarEdicion();
            }
            if (vModal == 'nuevaEdicion') {
                var seccion = $location.path().split('/')[1];
                var pos = $location.search('id', null);
                pos.path('/'+seccion+'/editarEntrada');
                salida.id = null;
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
        if (salida.id) {
            salida.modalInstance = $uibModal.open({
                templateUrl: 'app/shared/modal.html',
                controller: 'modalEliminarEntrada',
                backdrop: 'static',
                keyboard: false
            });
        }
        $rootScope.$on('eliminarEntrada', function(evento, resp){
            var publicacion = firebase.database().ref(rutaDB+salida.id);
            publicacion.update({'estado': 0}).then(function(){
                $timeout(function(){
                    $rootScope.$emit('entradaEliminada', [{'respuesta': true},{'titulo': salida.tituloEntrada}]);
                }, 1000);
            }).catch(function(){
                $timeout(function(){
                    $rootScope.$emit('entradaEliminada', [{'respuesta': false},{'titulo': salida.tituloEntrada}]);
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
        salida.id = null;
        $location.path('/entradas');
    }
    // Funciones disponibles para los páneles de categorias/subcategorias y palabras clave
    salida.cat = true;
    obtieneMetada.categorias().then(function(resp){
        salida.categorias = resp;
    });
    salida.cambiaCat = function(valor, miSub) {
        salida.categoria = valor;
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
        salida.subcategoria = valor;
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
            cuerpoMedio = '<img src="'+medio.ruta+'">';
        } else if (medio.tipo == 1) {
            cuerpoMedio = '<div class="contenedor"><img src="'+medio.thumb+'"><audio src="'+medio.ruta+'" controls></audio></div>';
        } else if (medio.tipo == 2) {
            cuerpoMedio = '<video src="'+medio.ruta+'" poster="'+medio.thumb+'" controls></video>';
        }
        var templateMedio = head+body+cuerpoMedio+footer+medio.pie+'</p></div>';
        salida.modalInstance = $uibModal.open({
            template: templateMedio,
            size: 'lg',
            windowClass: 'modal-medios',
            controller: 'modalVerMedio'
        });
    };
    salida.abrirCarga = function(){
        salida.modalInstance = $uibModal.open({
            templateUrl: 'app/shared/modalUpload.html',
            controller: modalCargarMedios,
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
            var nombreThumb = (salida.medios[salida.medioBorrar].thumb)?salida.medios[salida.medioBorrar].nombreThumb:null;
            var eliminaMedioRef = firebase.storage().ref(salida.id+'/'+salida.medios[salida.medioBorrar].nombre);
            eliminaMedioRef.delete().then(function(){
                if (nombreThumb) {
                    firebase.storage().ref(salida.id+'/'+nombreThumb).delete().then(function(){
                        finalizaEliminacion(true, null);
                    }).catch(function(error){
                        finalizaEliminacion(false, error);
                    });
                } else {
                    finalizaEliminacion(true, null);
                }
            }).catch(function(error){finalizaEliminacion(false,error);});
            function finalizaEliminacion(exito, mensaje) {
                $scope.boton01 = {
                    'invisible': false,
                    'estilo': 'btn-primary',
                    'icono': textos.botonCerrar.icono,
                    'texto': textos.botonCerrar.texto
                };
                if (exito){
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
                        'texto': mensaje,
                        'estilo': 'alert-danger'
                    };
                }
            }
        };
    }];
    // Controlador para la ventana modal de cargar medios
    var modalCargarMedios = ['$scope', 'cargaInterfaz', '$uibModalInstance', '$rootScope','Upload', '$timeout', function($scope, cargaInterfaz, $uibModalInstance, $rootScope, Upload, $timeout){
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
                $timeout(function(){
                    $scope.tarjetaUpVisible = false;
                    $scope.progresoVisible = [];
                    $scope.progresoValor = [];
                    $scope.mensajeError = [];
                    $scope.mensajeThumbError = [];
                    $scope.mensajeExito = [];
                    $scope.mensajeThumbExito = [];
                    $scope.progresoThumbVisible = [];
                    $scope.progresoThumbValor = [];
                    $scope.footer = {
                        'boton01': {'invisible': true},
                        'boton02': {'invisible': true}
                    };
                    cargaMedioFirebase(0);
                }, 500);
                function cargaMedioFirebase(llave) {
                    var archivo = $scope.misArchivos[llave];
                    $scope.progresoVisible[llave] = true;
                    $scope.progresoValor[llave] = 0;
                    var nombreArchivo, tipoArchivo, cargaArchivo;
                    var metadataMedio = {
                        'categoria': salida.categoria,
                        'subcategoria': salida.subcategoria,
                        'pie': metadata[llave].pie,
                        'palabrasClave': salida.palabrasClave.toString()
                    };
                    switch (archivo.type) {
                        case 'image/jpeg':
                            tipoArchivo = '.jpg';
                            break;
                        case 'audio/mp3':
                            tipoArchivo = '.mp3';
                            break;
                        case 'video/mp4':
                            tipoArchivo = '.mp4';
                            break;
                        default:
                            tipoArchivo = '.jpg';
                    }
                    mediosCargados[llave] = false;
                    nombreArchivo = Date.now()+tipoArchivo;
                    archivo.name = nombreArchivo;
                    cargaArchivo = firebase.storage().ref(salida.id+'/'+nombreArchivo).put(archivo,{customMetadata:metadataMedio});
                    cargaArchivo.on('state_changed',function(snapshot){
                        $scope.progresoValor[llave] = Math.ceil(100 * snapshot.bytesTransferred / snapshot.totalBytes);
                    },function(error){
                        $scope.mensajeError[llave] = textos.mensajeError + archivo.name + ': ' + error;
                        erroresMetadata.push(llave);
                        mediosCargados[llave] = true;
                        verificaCargas();
                        if (llave == $scope.misArchivos.length-1) {
                            $timeout(function(){
                                $scope.progresoValor[llave] = 100;
                                $scope.mensajeError[llave] = textos.mensajeError + archivo.name + ': ' + error;
                                cargaThumbFirebase(0);
                            }, 1000);
                        } else {
                            llave++;
                            cargaMedioFirebase(llave);
                        }
                    },function(){
                        metadata[llave].ruta = cargaArchivo.snapshot.downloadURL;
                        metadata[llave].nombre = nombreArchivo;
                        $scope.mensajeExito[llave] = archivo.name + textos.mensajeExito;
                        mediosCargados[llave] = true;
                        verificaCargas();
                        if (llave == $scope.misArchivos.length-1) {
                            $timeout(function(){
                                $scope.progresoValor[llave] = 100;
                                $scope.mensajeExito[llave] = archivo.name + textos.mensajeExito;
                                cargaThumbFirebase(0);
                            }, 1000);
                        } else {
                            llave++;
                            cargaMedioFirebase(llave);
                        }
                    });
                }
                function cargaThumbFirebase(llave) {
                    if ($scope.medioThumb[llave]) {
                        var archivo = $scope.medioThumb[llave];
                        $scope.progresoThumbVisible[llave] = true;
                        $scope.progresoThumbValor[llave] = 0;
                        var nombreArchivo, tipoArchivo, cargaArchivo;
                        var metadataMedio = {
                            'rutaMedio': metadata[llave].ruta,
                            'nombreMedio': metadata[llave].nombre
                        };
                        switch (archivo.type) {
                            case 'image/jpeg':
                                tipoArchivo = '.jpg';
                                break;
                            case 'audio/mp3':
                                tipoArchivo = '.mp3';
                                break;
                            case 'video/mp4':
                                tipoArchivo = '.mp4';
                                break;
                            default:
                                tipoArchivo = '.jpg';
                        }
                        thumbsCargados[llave] = false;
                        nombreArchivo = Date.now()+tipoArchivo;
                        archivo.name = nombreArchivo;
                        cargaArchivo = firebase.storage().ref(salida.id+'/'+nombreArchivo).put(archivo,{customMetadata:metadataMedio});
                        cargaArchivo.on('state_changed',function(snapshot){
                            $scope.progresoThumbValor[llave] = Math.ceil(100 * snapshot.bytesTransferred / snapshot.totalBytes);
                        },function(error){
                            $scope.mensajeThumbError[llave] = textos.mensajeError + archivo.name + ': ' + error;
                            erroresMetadata.push(llave);
                            thumbsCargados[llave] = true;
                            verificaCargas();
                            llave++;
                            cargaThumbFirebase(llave);
                            if (llave == $scope.medioThumb.length-1) {
                                $timeout(function(){
                                    $scope.progresoThumbValor[llave] = 100;
                                    $scope.mensajeThumbError[llave] = textos.mensajeError + archivo.name + ': ' + error;
                                }, 1000);
                            }
                        },function(){
                            metadata[llave].thumb = cargaArchivo.snapshot.downloadURL;
                            metadata[llave].nombreThumb = nombreArchivo;
                            $scope.mensajeThumbExito[llave] = archivo.name + textos.mensajeExito;
                            thumbsCargados[llave] = true;
                            verificaCargas();
                            llave++;
                            cargaThumbFirebase(llave);
                            if (llave == $scope.misArchivos.length-1) {
                                $timeout(function(){
                                    $scope.progresoThumbValor[llave] = 100;
                                    $scope.mensajeThumbExito[llave] = archivo.name + textos.mensajeExito;
                                }, 1000);
                            }
                        });
                    } else {
                        if (llave < $scope.misArchivos.length-1) {
                            llave++;
                            cargaThumbFirebase(llave);
                        }
                    }
                }
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
    }];
}]);
// Controlador para la ventana modal de Ver medio
editarEntradas.controller('modalVerMedio', ['$scope', '$uibModalInstance', function ($scope, $uibModalInstance) {
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
}]);
// Controlador para la ventana modal de Eliminar Entrada
editarEntradas.controller('modalEliminarEntrada', ['$scope', 'cargaInterfaz', '$uibModalInstance', '$rootScope', function($scope, cargaInterfaz, $uibModalInstance, $rootScope){
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
            if (resp[0]) {
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
editarEntradas.service('obtieneMetada', [function(){
    var rutaCat = 'categorias/';
    var query = firebase.database().ref(rutaCat).once('value');
    var obtieneMetada = {
        categorias: function() {
            var promesa = query.then(function(resp){
                var data = [];
                angular.forEach(resp.val(), function(valor, llave){data.push(llave)});
                return data;
            });
            return promesa;
        },
        subcategorias: function(cat) {
            var promesa = query.then(function(resp){
                var data = [];
                angular.forEach(resp.val()[cat].subcategorias, function(valor, llave){data.push(valor);});
                return data;
            });
            return promesa;
        },
        palabrasClave: function(cat) {
            var promesa = query.then(function(resp){
                var data = [];
                angular.forEach(resp.val()[cat].palabrasClave, function(valor, llave){data.push(valor);});
                return data;
            });
            return promesa;
        }
    };
    return obtieneMetada;
}]);