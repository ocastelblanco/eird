/* global angular idioma */
var entradas = angular.module('entradas', []);
entradas.controller('adminEntradas', ['$http', 'i18nService', 'cargaInterfaz', function($http, i18nService, cargaInterfaz){
    console.log('adminEntradas cargado');
    var salida = this;
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
        showGridFooter:true
    };
    $http.get('php/entradas.json').then(function(resp){
        salida.datosTabla.data = resp.data;
    });
}]);