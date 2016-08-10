/* global angular firebase */
var ingreso = angular.module('ingreso', []);
ingreso.controller('adminIngreso', ['$location',function($location){
    console.log('adminIngreso');
    var ubicacion = $location.path().split('/');
    var yo = this;
    console.log(ubicacion);
    if(ubicacion.length > 2) {
        yo.tipoIngreso = 'app/ingreso/'+ubicacion[2]+'.html';
    } else {
        yo.tipoIngreso = 'app/ingreso/login.html';
    }
}]);
ingreso.controller('adminRegistro', ['$firebaseObject',function($firebaseObject){
    console.log('adminRegistro');
    var yo = this;
    var ref = firebase.database().ref('/codigos');
    var fo = $firebaseObject(ref);
    fo.$loaded().then(function(){
    });
    yo.verificarCodigo = function(codigo) {
        if (fo) {//-KOBHqlxnbxCHRVkVN2v
            angular.forEach(fo, function(valor, llave){
                if (codigo == llave) {
                    yo.crearCuenta = true;
                    yo.validez = new Date(valor.fechaValidez).toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
                }
            });
        }
    };
}]);