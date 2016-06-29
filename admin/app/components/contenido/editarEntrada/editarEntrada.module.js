/* global angular idioma */
var entradaID;
var editarEntradas = angular.module('editarEntradas', ['ngSanitize']);
editarEntradas.controller('editarEntradas',['$uibModal','$location','$http','$rootScope','$timeout','$route','obtieneMetada',function($uibModal, $location, $http, $rootScope, $timeout, $route, obtieneMetada){
    var salida = this;
    salida.datosPOST = {};
    // Cargar información cuando ya existe un ID (se editó la entrada)
    var location = $location.search();
    if (location.id) {
        entradaID = location.id;
        salida.datosPOST.id = location.id;
        salida.datosPOST.accion = 'listarEntrada';
        $http.post('php/entradas.php', salida.datosPOST).then(function(resp){
            console.log('Al solicitar la entrada '+entradaID+' se obtuvo',resp.data);
            salida.tituloEntrada = resp.data.titulo;
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
    salida.guardaCambios = function() {
        salida.modalInstance = $uibModal.open({
            templateUrl: 'app/shared/modal.html',
            controller: 'modalGuardarEntrada',
            backdrop: 'static'
        });
        if (entradaID) {salida.datosPOST.id = entradaID;}
        salida.datosPOST.titulo = salida.tituloEntrada;
        salida.datosPOST.texto = salida.textoEntrada;
        // Y todos los demás datos necesarios, como Categorías, subcategorías y palabras clave.
        $http.post('php/entradas.php', salida.datosPOST).then(function(resp){
            $timeout(function(){
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
                backdrop: 'static'
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
    
    salida.cat = true;
    obtieneMetada.categorias().then(function(resp){
        salida.categorias = resp;
    });
    salida.cambiaCat = function(valor) {
        salida.numSub = null;
        obtieneMetada.subcategorias(valor).then(function(resp){
            salida.subcategorias = resp;
        });
    };
    salida.PC = [];
    salida.palabrasClave = ["Historia nacional", "Conflicto", "Independencia", "Región"];
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
        }
    };
    return obtieneMetada;
}]);