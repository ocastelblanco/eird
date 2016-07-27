/* global angular firebase */
var portada = angular.module('portada', []);
portada.controller('articuloDestacado', ['cargaInterfaz', '$timeout', function(cargaInterfaz, $timeout){
    var salida = this;
    var ruta = 'portada/articuloDestacado';
    salida.igual = function(op1, op2) {
        if (op1 == op2) {return true;}else{return false;}
    };
    firebase.database().ref(ruta).once('value').then(function(snapshot) {
        salida.sel = snapshot.val();
        cargaInterfaz.textos().then(function(resp){
            salida.opciones = resp.contenido.portada.articuloDestacado.opciones;
        });
    });
    salida.cambio = function(index){
        salida.cargando = true;
        firebase.database().ref(ruta).set(index).then(function(){
            $timeout(function(){salida.cargando = false;},500);
        }).catch(function(val){
            console.log('Error: ', val);
        });
    };
}]);
portada.controller('medioDestacado', ['cargaInterfaz', '$timeout', function(cargaInterfaz, $timeout){
    var salida = this;
    var ruta = 'portada/medioDestacado';
    salida.igual = function(op1, op2) {
        if (op1 == op2) {return true;}else{return false;}
    };
    firebase.database().ref(ruta).once('value').then(function(snapshot) {
        salida.sel = snapshot.val();
        cargaInterfaz.textos().then(function(resp){
            salida.opciones = resp.contenido.portada.medioDestacado.opciones;
        });
    });
    salida.cambio = function(index){
        salida.cargando = true;
        firebase.database().ref(ruta).set(index).then(function(){
            $timeout(function(){salida.cargando = false;},500);
        }).catch(function(val){
            console.log('Error: ', val);
        });
    };
}]);