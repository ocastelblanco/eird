/* global angular firebase */
var ingreso = angular.module('ingreso', []);
ingreso.controller('adminIngreso', ['$location',function($location){
    console.log('adminIngreso');
    var ubicacion = $location.path().split('/');
    var yo = this;
    if(ubicacion.length > 2) {
        yo.tipoIngreso = 'app/ingreso/'+ubicacion[2]+'.html';
    } else {
        yo.tipoIngreso = 'app/ingreso/login.html';
    }
}]);
ingreso.controller('adminRegistro', ['$firebaseObject', 'Auth', '$timeout',function($firebaseObject,Auth,$timeout){
    console.log('adminRegistro');
    var yo = this;
    var ref = firebase.database().ref('/codigos');
    var fo = $firebaseObject(ref);
    var refCodigo;
    var emails = {};
    fo.$loaded().then(function(){
        yo.foCargado = true;
        yo.dias = llenaDia();
        yo.annos = llenaAnno();
        emails = obtieneEmails(fo);
    });
    yo.validarCodigo = function(codigo) {
        if (fo[codigo] && fo[codigo].estado === 0) {
            yo.codigoValido = true;
        } else {
            yo.codigoValido = false;
        }
    };
    yo.verificarCodigo = function(codigo) {//-KOBHqlxnbxCHRVkVN2v
        yo.crearCuenta = true;
        yo.validez = new Date(fo[codigo].fechaValidez).toLocaleDateString('es-ES',{weekday:'long',year:'numeric',month:'long',day:'numeric'});
        refCodigo = $firebaseObject(ref.child(codigo));
    };
    yo.ajustaDias = function(){
        yo.dias = llenaDia(yo.mes, yo.anno);
    };
    yo.escribeEmail = function(){
        yo.emailUnico = !emails[yo.email];
    };
    yo.registrarCuenta = function(codigo){
        yo.registrando = true;
        yo.errorAutenticacion = false;
        yo.errorRegistro = false;
        var nacimiento = new Date(yo.anno,yo.mes,yo.dia);
        yo.nacimiento = nacimiento.toLocaleDateString('es-ES',{year:'numeric',month:'long',day:'numeric'});
        refCodigo.nombres = yo.nombres;
        refCodigo.apellidos = yo.apellidos;
        refCodigo.fechaNacimiento = nacimiento.toJSON();
        refCodigo.email = yo.email;
        refCodigo.estado = 1;
        refCodigo.$save().then(function(ref){
            Auth.$createUserWithEmailAndPassword(yo.email, yo.clave).then(function(firebaseUser) {
                var user = firebase.auth().currentUser;
                user.updateProfile({displayName: yo.nombres+' '+yo.apellidos}).then(function() {
                    $timeout(function(){
                        yo.registrando = false;
                        yo.yaRegistrado = true;
                    },500);
                }, function(error) {
                    errorRegistro(error);
                });
            }).catch(function(error) {
                errorRegistro(error);
            });
        });
    };
    function errorRegistro(error){
        refCodigo.nombres = '';
        refCodigo.apellidos = '';
        refCodigo.fechaNacimiento = '';
        refCodigo.email = '';
        refCodigo.estado = 0;
        refCodigo.$save().then(function(){
            yo.registrando = false;
            yo.yaRegistrado = false;
            if (error.code == 'auth/email-already-in-use') {
                yo.errorAutenticacion = true;
            } else {
                yo.errorRegistro = true;
                yo.mensajeErrorRegistro = error.code+': '+error.message;
            }
        });
    }
}]);
ingreso.controller('adminLogin',['Auth', '$location', '$firebaseObject', function(Auth, $location, $firebaseObject){
    console.log('adminLogin');
    var yo = this;
    var ref = firebase.database().ref('/codigos');
    var fo = $firebaseObject(ref);
    var emails = {};
    fo.$loaded().then(function(){
        yo.foCargado = true;
        emails = obtieneEmails(fo);
    });
    yo.ingresar = function(){
        yo.errorAutenticacion = false;
        yo.ingresando = true;
        Auth.$signInWithEmailAndPassword(yo.email, yo.clave).then(function(){
            yo.ingresando = false;
            if (!fo[emails[yo.email]] || !fo[emails[yo.email]].fechaValidez) {
                Auth.$signOut();
                yo.errorAutenticacion = 'Usuario no encontrado en la base de datos.';
                yo.ingresando = false;
            } else {
                var fechaValidez = new Date(fo[emails[yo.email]].fechaValidez);
                var hoy = new Date();
                if (fechaValidez < hoy) {
                    Auth.$signOut();
                    yo.codigoExpirado = fechaValidez.toLocaleDateString('es-ES',{year:'numeric',month:'long',day:'numeric'});
                } else {
                    $location.path('/');
                }
            }
        }).catch(function(error){
            yo.errorAutenticacion = error.code+': '+error.message;
            yo.ingresando = false;
        });
    };
}]);
ingreso.controller('adminRestaurar',['$firebaseObject', 'Auth', function($firebaseObject,Auth){
    console.log('adminRestaurar');
    var yo = this;
    var ref = firebase.database().ref('/codigos');
    var fo = $firebaseObject(ref);
    var emails = {};
    fo.$loaded().then(function(){
        yo.foCargado = true;
        emails = obtieneEmails(fo);
    });
    yo.restaurando = false;
    yo.emailValido = false;
    yo.restauracionEnviada = false;
    yo.restaurar = function(){
        yo.restaurando = true;
        Auth.$sendPasswordResetEmail(yo.email).then(function(){
            yo.restaurando = false;
            yo.restauracionEnviada = true;
            yo.restaurarExito = true;
        }).catch(function(error){
            yo.restaurando = false;
            yo.restauracionEnviada = true;
            yo.restaurarExito = false;
            yo.restaurarError = error.code+': '+error.message;
        });
    };
    yo.validaEmail = function(){
        if (emails[yo.email]) {
            yo.emailValido = true;
        } else {
            yo.emailValido = false;
        }
    };
}]);
function obtieneEmails(fo) {
    var salida = {};
    angular.forEach(fo, function(valor, llave){
        if(valor.email) {
            salida[valor.email] = llave;
        }
    });
    return salida;
}
function llenaDia(mes, anno) {
    var salida = [];
    var inicio = 1;
    var final;
    var dias_mes = [32, 29, 32, 31, 32, 31, 32, 32, 31, 32, 31, 32];
    var bisiesto = [1904,1908,1912,1916,1920,1924,1928,1932,1936,1940,1944,1948,1952,1956,1960,1964,1968,1972,1976,1980,1984,1988,1992,1996,2004,2008,2012,2016,2020,2024,2028,2032,2036,2040,2044,2048,2052,2056,2060,2064,2068,2072,2076,2080,2084,2088,2092,2096];
    if (!mes) {
        final = 32;
    } else {
        if (bisiesto.find(function(e){if(e==anno){return true}}) && mes == 1) {
            final = 30;
        } else {
            final = dias_mes[mes];
        }
    }
    for (var i=inicio;i<final;i++) {
        salida.push(i);
    }
    return salida;
}
function llenaAnno(){
    var salida = [];
    var final = new Date().getFullYear();
    for (var i=final;i>1900;i--) {
        salida.push(i);
    }
    return salida;
}