/* global angular idioma */
var entradas = angular.module('entradas', []);
entradas.controller('adminEntradas', ['$http', 'i18nService', 'cargaInterfaz', '$scope', '$location',
                            function($http, i18nService, cargaInterfaz, $scope, $location){
    //console.log('adminEntradas cargado');
    var salida = this;
    salida.estadoEditar = true;
    salida.estadoEliminar = true;
    salida.numFilasSeleccionadas = 0;
    i18nService.setCurrentLang(idioma);
    cargaInterfaz.textos().then(function(resp){
        salida.titulosTabla = resp.contenido.entradas.encabezadoTablaDatos;
        salida.datosTabla.columnDefs = [
            {name: 'id', visible: false},
            {name: 'titulo', displayName: salida.titulosTabla.nomEntradas},
            {name: 'categoria', displayName: salida.titulosTabla.categoria},
            {name: 'subcategoria', displayName: salida.titulosTabla.subcategoria},
            {name: 'fecha', displayName: salida.titulosTabla.fecha},
            {name: 'estado', displayName: salida.titulosTabla.estado}
        ];
    });
    salida.datosTabla = {
        enableRowSelection: true,
        enableSelectAll: true,
        enableFiltering: true,
        selectionRowHeaderWidth: 35,
        rowHeight: 35,
        showGridFooter:true,
        paginationPageSizes: [2, 5, 7],
        paginationPageSize: 2
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
    $http.get('php/entradas.json').then(function(resp){
        salida.datosTabla.data = resp.data;
    });
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
    }
    salida.editarEntrada = function() {
        console.log('Edita la entrada ', salida.filasSeleccionadas[0].id);
    }
    salida.eliminarEntrada = function() {
        console.log('Elimina las entradas');
        angular.forEach(salida.filasSeleccionadas, function(value, key) {
            console.log(value.id);
        });
    }
}]);