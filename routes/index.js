const express = require('express');
const router = express.Router();
const usuariosController = require("../controllers/usuariosController");
const hospitalesController = require("../controllers/hospitalesController");
const medicosController = require("../controllers/medicosController");
const busquedaController = require("../controllers/busquedaController");
const uploadsController = require("../controllers/uploadsController");

//Middleware para proteger las rutas.
const auth = require("../middleware/auth");


module.exports = () => {
    /*** UPLOADS ***/
    router.put('/upload/:coleccion/:id', auth, uploadsController.uploadImg); // Cambia/agregar img 
    router.get('/upload/:coleccion/:img', uploadsController.obtenerImagen); // Obtiene las img.
    /****BUSQUEDA ***/
    router.get('/busqueda/todo/:busqueda', busquedaController.busquedaGeneral); // Obtiene todos los elementos buscados (hasta 10 de cada coleccion)
    router.get('/busqueda/coleccion/:tabla/:busqueda', busquedaController.busquedaPorColeccion); // Obtiene elementos segun su coleccion (hasta 10 de la coleccion)
    /*** MEDICOS ***/
    router.get('/medico', medicosController.mostrarMedicos); // Obtiene todos los medicos.
    router.post('/medico', auth, medicosController.registrarMedico); // Registra nuevos medico.
    router.put('/medico/:id', auth, medicosController.actualizarMedico); // Actualiza un Medico.
    router.delete('/medico/:id', auth, medicosController.borrarMedico); // Borra un Medico.
    /****HOSPITALES****/
    router.post('/hospital', auth, hospitalesController.registrarHospital); // Registra nuevos hospital.
    router.get('/hospital', hospitalesController.mostrarHospitales); // Obtiene todos los hospitales.
    router.put('/hospital/:id', auth, hospitalesController.actualizarHospital); // Actualiza un Hospital.
    router.delete('/hospital/:id', auth, hospitalesController.borrarHospital); // Borra un Hospital.

    /****USUARIOS****/
    router.post('/usuario', usuariosController.registrarUsuario); // Registra nuevos usuarios.
    router.post('/login', usuariosController.login);
    router.get('/usuario', usuariosController.mostrarUsuarios); // Obtiene todos los usuarios.
    router.put('/usuario/:id', auth, usuariosController.actualizarUsuario); // Actualiza un usuario.
    router.delete('/usuario/:id', auth, usuariosController.borrarUsuario); // Borra un usuario.

    router.get('/', (req, res) => {
        res.send('inicio');
    });
    return router;
}