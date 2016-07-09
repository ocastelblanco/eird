/* global angular idioma */
var entradaID;
var editarEntradas = angular.module('editarEntradas', ['ngSanitize']);
editarEntradas.controller('editarEntradas',['$uibModal','$location','$http','$rootScope','$timeout','$route','obtieneMetada','Upload', function($uibModal,$location,$http,$rootScope,$timeout,$route,obtieneMetada,Upload){
    var salida = this;
    salida.datosPOST = {};
    salida.PC = [];
    salida.medios = [{
        'ruta': 'http://winteriscoming.net/wp-content/uploads/2016/03/Daenerys-Targaryen-crop-630x371.jpg',
        'pie': 'Daenerys Targaryen',
        'tipo': 0
    }, {
        'ruta': 'https://archive.org/download/Free_20s_Jazz_Collection/2to2.mp3',
        'pie': '2to2: 78 RPMs and Cylinder Recordings',
        'tipo': 1,
        'thumb': 'https://ia802609.us.archive.org/9/items/Free_20s_Jazz_Collection/otpump.jpg'
    }, {
        'ruta': 'https://archive.org/download/HSF-mov-moon/moon_512kb.mp4',
        'pie': 'Luna vista desde la tierra en una misión del Apollo 11 o cualquier otro cohete o aparato',
        'tipo': 2,
        'thumb': 'https://archive.org/services/img/HSF-mov-moon'
    },{
        'ruta': 'https://pbs.twimg.com/profile_images/458643675250446336/TSGxBFjj.jpeg',
        'pie': 'Margaery Tyrell',
        'tipo': 0
    },{
        'ruta': 'http://cdn.thedailybeast.com/content/dailybeast/articles/2014/06/23/game-of-thrones-star-maisie-williams-on-arya-stark-s-s4-journey-and-her-crush-on-andrew-garfield/jcr:content/image.img.2000.jpg/1403516733247.cached.jpg',
        'pie': 'Arya Stark',
        'tipo': 0
    }];
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
            cuerpoMedio = '<img src="'+medio.ruta+'">';
        } else if (medio.tipo == 1) {
            cuerpoMedio = '<audio src="'+medio.ruta+'" controls></audio>';
        } else if (medio.tipo == 2) {
            cuerpoMedio = '<video src="'+medio.ruta+'" poster="'+medio.thumb+'" controls></video>';
        }
        var templateMedio = head+body+cuerpoMedio+footer+medio.pie+'</p></div>';
        salida.modalInstance = $uibModal.open({
            template: templateMedio,
            size: 'lg',
            windowClass: 'modal-medios',
            controller: 'verMedio'
        });
    };
    salida.rutaThumb = function(medio) {
        return (medio.tipo)?medio.thumb:medio.ruta;
    };
    
}]);
// Controlador para la ventana modal de Ver medio
editarEntradas.controller('verMedio', ['$scope', '$uibModalInstance', function ($scope, $uibModalInstance) {
    $scope.cancel = function () {
        console.log('Cerrando imagen');
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