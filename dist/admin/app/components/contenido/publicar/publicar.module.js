/* global angular idioma firebase */
var publicar = angular.module('publicar', []);
publicar.controller('adminPublicar', ['i18nService', 'cargaInterfaz', '$scope', '$location', '$uibModal', '$rootScope', '$timeout', function(i18nService, cargaInterfaz, $scope, $location, $uibModal, $rootScope, $timeout){
    //console.log('Publicar cargado');
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
                {name: 'fecha'}
        ]
    };
    salida.estadoVer = true;
    salida.estadoPublicar = true;
    salida.numFilasSeleccionadas = 0;
    i18nService.setCurrentLang(idioma);
    cargaInterfaz.textos().then(function(resp){
        salida.titulosTabla = resp.contenido.entradas.encabezadoTablaDatos;
        salida.datosTabla.columnDefs = [
            {name: 'id', visible: false},
            {name: 'titulo', displayName: salida.titulosTabla.nomEntradas, enableColumnMenu: false, width: '30%'},
            {name: 'categoria', displayName: salida.titulosTabla.categoria, enableColumnMenu: false},
            {name: 'subcategoria', displayName: salida.titulosTabla.subcategoria, enableColumnMenu: false},
            {name: 'fecha', displayName: salida.titulosTabla.fecha, enableColumnMenu: false}
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
    };
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
            salida.estadoVer = false;
            salida.estadoPublicar = false;
        } else if (salida.numFilasSeleccionadas > 1) {
            salida.estadoVer = true;
            salida.estadoPublicar = false;
        } else if (salida.numFilasSeleccionadas == 0) {
            salida.estadoVer = true;
            salida.estadoPublicar = true;
        }
    };
    // Detecta las acciones de los botones de acción
    salida.verEntrada = function(){
        salida.modalInstance = $uibModal.open({
            templateUrl: 'app/shared/modalVerEntrada.html',
            size: 'lg',
            windowClass: 'modal-verentrada',
            controller: modalVerEntrada
        });
    };
    salida.publicarEntrada = function(){
        salida.estadoPublicando = true;
        publicarEntradas(salida.filasSeleccionadas);
    };
    var modalVerEntrada = ['$uibModalInstance', '$scope', '$rootScope', function($uibModalInstance, $scope, $rootScope){
        var textos, posElegida;
        $scope.categoria = {};
        $scope.subcategoria = {};
        $scope.palabrasClave = {};
        $scope.medios = {};
        angular.forEach(salida.datosTabla.data, function(valor, llave) {
            if(salida.filasSeleccionadas[0].id == valor.id){posElegida = llave;}
        });
        cargaInterfaz.textos().then(function(resp){
            textos = resp.contenido.publicar.modalVer;
            $scope.publicar = false;
            $scope.publicando = textos.publicando;
            $scope.footer = {
                'boton01': {
                    'invisible': false,
                    'estilo': 'btn-primary',
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
                    'invisible': true
                }
            };
            $scope.boton01 = function(){
                publicarEntradas([salida.datosTabla.data[posElegida]]);
                $scope.publicar = true;
            };
            $scope.boton02 = function(){$uibModalInstance.dismiss();};
            $scope.categoria.titulo     = resp.contenido.editarEntrada.categorias.categorias.titulo;
            $scope.subcategoria.titulo  = resp.contenido.editarEntrada.categorias.subcategorias.titulo;
            $scope.palabrasClave.titulo = resp.contenido.editarEntrada.palabrasClave.panel.header.texto;
            $scope.medios.titulo        = resp.contenido.editarEntrada.elementosMultimedia.titulo;
            $scope.medios.tipos         = resp.contenido.editarEntrada.elementosMultimedia.tipos;
            cargarEntrada();
        });
        $rootScope.$on('entradaPublicada', function(evt){
            $timeout(function(){
                if(posElegida<salida.datosTabla.data.length - 1){posElegida++;}else{posElegida = 0;}
                cargarEntrada();
                $scope.publicar = false;
            },500);
        });
        $scope.anteriorEntrada = function(){
            if(posElegida){posElegida--;}else{posElegida = salida.datosTabla.data.length - 1;}
            cargarEntrada();
        };
        $scope.siguienteEntrada = function(){
            if(posElegida<salida.datosTabla.data.length - 1){posElegida++;}else{posElegida = 0;}
            cargarEntrada();
        };
        $scope.rutaThumb = function(medio) {
            return (medio.tipo)?medio.thumb:medio.ruta;
        };
        function cargarEntrada() {
            $scope.titulo = salida.datosTabla.data[posElegida].titulo;
            $scope.contenido = salida.datosTabla.data[posElegida].texto;
            $scope.categoria.texto = salida.datosTabla.data[posElegida].categoria;
            $scope.subcategoria.texto = salida.datosTabla.data[posElegida].subcategoria;
            $scope.palabrasClave.palabras = salida.datosTabla.data[posElegida].palabrasClave;
            $scope.medios.medios = salida.datosTabla.data[posElegida].medios;
        }
    }];
    function publicarEntradas(entradas){
        var aPublicar = [];
        angular.forEach(entradas, function(value, key) {
            aPublicar.push(value.id);
        });
        publicaFirebase(0);
        function publicaFirebase(llave) {
            var publicacion = firebase.database().ref(rutaDB+aPublicar[llave]);
            publicacion.update({'estado': 1}).then(function(){
                firebase.storage().ref(aPublicar[llave]).delete();
                if (llave < aPublicar.length-1) {
                    llave++;
                    publicaFirebase(llave);
                } else {
                    $timeout(function(){
                        angular.forEach(entradas, function(valor, clave) {
                            angular.forEach(salida.datosTabla.data, function(value, key) {
                                if(valor.id == value.id) {salida.datosTabla.data.splice(key,1);}
                            });
                        });
                        salida.estadoPublicando = false;
                        salida.numFilasSeleccionadas = 0;
                        $scope.gridApi.selection.clearSelectedRows();
                        salida.activaBotones();
                        $rootScope.$emit('entradaPublicada');
                    }, 1000);
                }
            }).catch(function(error){
                $timeout(function(){
                    console.log(error);
                }, 1000);
            });
        }
    }
}]);