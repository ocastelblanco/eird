/* global angular idioma */
var editarEntradas = angular.module('editarEntradas', ['ngSanitize']);
editarEntradas.controller('editarEntradas', ['$uibModal', '$location', function($uibModal, $location){
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
        valid_elements : '-a[href],-strong/b,-div[align],br,-p,-h1,-h2',
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
        console.log('Se guarda la info:',salida.tituloEntrada, salida.textoEntrada);
        salida.modalInstance = $uibModal.open({
            templateUrl: 'app/shared/modal.html',
            controller: 'modalGuardarEntrada',
            backdrop: 'static'
        });
    };
    salida.cancelaEdicion = function() {
        salida.modalInstance = $uibModal.open({
            templateUrl: 'app/shared/modal.html',
            controller: 'modalCancelarEdicion'
        });
        salida.modalInstance.result.then(function(vModal){
            console.log('La ventana ejecutada es', vModal);
            if (vModal == 'cancelarEdicion') {
                $location.path('/entradas');
            }
        });
    };
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
                'estilo': 'btn-warning',
                'icono': {
                    'invisible': false,
                    'estilo': textos.footer.boton01.icono
                }
            },
            'boton02': {
                'invisible': false,
                'texto': textos.footer.boton02.texto,
                'estilo': 'btn-default',
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
editarEntradas.controller('modalGuardarEntrada', ['$scope', 'cargaInterfaz', '$uibModalInstance', '$timeout',
                                        function($scope, cargaInterfaz, $uibModalInstance, $timeout){
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
        var paso2 = $timeout(function(){
            $scope.titulo = textos.titulo2;
            $scope.cuerpo = {
                'progreso': {
                    'invisible': true
                },
                'contenido': textos.contenido
            };
            $scope.footer = {
                'boton01': {
                    'invisible': false,
                    'estilo': 'btn-default',
                    'texto': textos.boton01.texto,
                    'icono': {
                        'invisible': true
                    }
                },
                'boton02': {
                    'invisible': false,
                    'estilo': 'btn-default',
                    'texto': textos.boton02.texto,
                    'icono': {
                        'invisible': true
                    }
                },
                'boton03': {
                    'invisible': false,
                    'estilo': 'btn-default',
                    'texto': textos.boton03.texto,
                    'icono': {
                        'invisible': true
                    }
                }
            };
        }, 5000);
    });
}]);