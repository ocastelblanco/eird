/* global angular */
// Módulos de la app principal eirdAdmin
var eirdAdmin = angular.module('eirdAdmin', [
    'ui.bootstrap',
    'ngRoute',
    'inicio'
]);
// Controladores
eirdAdmin.controller('controladorPrincipal', function() {
    // Controlador principal
    console.log('ControladorPrincipal iniciado');
    var salida = this;
    // Contenidos básicos de la interfaz
    salida.titulo = "ENREDO";
    salida.panelLogin = {};
    salida.panelLogin.titulo = "Ingrese sus datos para iniciar sesión";
    salida.panelLogin.labelUsuario = "Usuario";
    salida.panelLogin.labelClave = "Contraseña";
    salida.panelLogin.labelSubmit = "Ingresar";
});