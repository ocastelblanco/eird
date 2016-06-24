/* global angular idioma */
var entradaID;
var editarEntradas = angular.module('editarEntradas', ['ngSanitize']);
editarEntradas.controller('editarEntradas', ['$uibModal', '$location', '$http', '$rootScope', '$timeout', '$route',
                                     function($uibModal, $location, $http, $rootScope, $timeout, $route){
    var salida = this;
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
    salida.guardaCambios = function() {
        salida.modalInstance = $uibModal.open({
            templateUrl: 'app/shared/modal.html',
            controller: 'modalGuardarEntrada',
            backdrop: 'static'
        });
        salida.datosPOST = {};
        if (entradaID) {salida.datosPOST.id = entradaID;}
        salida.datosPOST.titulo = salida.tituloEntrada;
        salida.datosPOST.texto = salida.textoEntrada;
        // Y todos los demás datos necesarios, como Categorías, subcategorías y palabras clave.
        $http.post('php/entradas.php', salida.datosPOST).then(function(resp){
            console.log('Se envió', salida.datosPOST, 'exitosamente');
            $timeout(function(){
                $rootScope.$emit('entradaGuardada', [resp.data,salida.datosPOST]);
            }, 1000);
            entradaID = resp.data.id;
            $location.search('id', entradaID);
            console.log('Se recibe del PHP', resp.data);
        });
        salida.modalInstance.result.then(function(vModal){
            if (vModal == 'cancelarEdicion') {
                cancelarEdicion();
            }
            if (vModal == 'nuevaEdicion') {
                var seccion = $location.path().split('/')[1];
                var pos = $location.search('id', null);
                pos.path('/'+seccion+'/editarEntrada');
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
    function cancelarEdicion(){
        $location.path('/entradas');
    }
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