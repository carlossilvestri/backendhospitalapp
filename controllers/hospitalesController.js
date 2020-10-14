const Hospitales = require("../models/Hospitales");
const bcrypt = require("bcrypt");
require('dotenv').config({
    path: 'variables.env'
});

// ==========================================
// Crear un nuevo usuario: POST - /hospital Params: nombre, token
// ==========================================
exports.registrarHospital = async (req, res) => {
    const body = req.body;
    const usuario = req.usuario; // Al tener el token puedo tener acceso a req.usuario
    // Verificar que se envie los campos obligatorios (nombre, email, password)
    if (!body.nombre || !usuario) {
        // Accion prohibida. (Error)
        return res.status(403).json({
            ok: false,
            mensaje: 'Faltan campos obligatorios. Revisar el nombre y token del usuario.'
        });
    } else {
        const usuarioId = usuario._id;
        const {
            nombre,
            img
        } = body;
        // Hay datos, crear el objeto usuarios.
        const hospital = new Hospitales({
            nombre,
            img,
            usuarioId
        });
        hospital.save((err, hospitalGuardado) => {
            // Si hay algun otro error entonces mostrarlo al usuario
            if (err) {
                // 400 Bad request.
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al crear hospital',
                    errors: err
                });
            }
            // Todo bien. 201 creado
            res.status(201).json({
                ok: true,
                hospital: hospitalGuardado,
                usuariotoken: req.usuario
            });
        });
    }
}
// ==========================================
// Obtiene todos los Hospitales: GET /hospital 
// ==========================================
exports.mostrarHospitales = async (req, res, next) => {
    var desde = req.query.desde || 0;
    desde = Number(desde);
    // Encontra todos los usuarios. 
    Hospitales.find({})
        .populate('usuarioId', 'nombre email')
        .skip(desde)
        .limit(5) // Envia/Muestra  5 registros
        .exec(
            (err, hospitales) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error cargando hospitales',
                        errors: err
                    });
                }
                Hospitales.countDocuments({}, (err2, conteo) => {
                    if (err2) {
                        return res.status(500).json({
                            ok: false,
                            mensaje: 'Error contando los medicos',
                            errors: err2
                        });
                    }
                    res.status(200).json({
                        ok: true,
                        total: conteo,
                        hospitales
                    });
                });
            }
        );
}

// ==========================================
// Actualizar hospital. PUT /hospital/:id Params: id, token. Body: nombre, img.
// ==========================================
exports.actualizarHospital = async (req, res) => {

    const id = req.params.id;
    const body = req.body;
    const usuario = req.usuario; // Al tener el token puedo tener acceso a req.usuario
    // Verificar que se envie los campos obligatorios (nombre, id, password)
    if (!body.nombre || !id || !usuario) {
        // Accion prohibida. (Error)
        return res.status(403).json({
            ok: false,
            mensaje: 'Faltan campos obligatorios. Revisar el nombre, email y password.'
        });
    } else {
        // Hay datos. Buscar el hospital a actualizar.
        Hospitales.findById(id, (err, hospital) => {
            // Si no se consiguio al hospital entonces:
            if (!hospital) {
                // 400 Bad request
                return res.status(400).json({
                    ok: false,
                    mensaje: 'El hospital con el id ' + id + ' no existe',
                    errors: {
                        message: 'No existe un hospital con ese ID'
                    }
                });
            }
            // Si hay errores como por ejm. no se consiguio el hospital entonces mostrar notificacion.
            if (err) {
                // Error 500 Internal Server Error.
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error al buscar hospital',
                    errors: err
                });
            }
            // Se actualiza los datos: (nombre, img).
            hospital.nombre = body.nombre;
            hospital.img = body.img;
            // hospital.role = body.role;
            // Finalmente guardar en la BD.
            hospital.save((err, hospitalGuardado) => {

                if (err) {
                    // 400 Bad request
                    return res.status(400).json({
                        ok: false,
                        mensaje: 'Error al actualizar hospital',
                        errors: err
                    });
                }
                hospitalGuardado.usuarioId = ':)';

                res.status(200).json({
                    ok: true,
                    usuario: hospitalGuardado
                });

            });

        });
    }

};
// ==========================================
// Borra un usuario por su id: DELETE /hospital/:id
// ==========================================
exports.borrarHospital = async (req, res, next) => {
    const id = req.params.id;
    // Verificar que el id no este vacio
    if (!id) {
        // Accion prohibida. (Error)
        return res.status(403).json({
            ok: false,
            mensaje: 'El id del hospital es obligatorio'
        });
    } else {
        // Existe el id, intentar borrar el usuario.
        Hospitales.findByIdAndRemove(id, (err, hospitalBorrado) => {
            // Si hay algun error del servidor
            if (err) {
                // 500 Internal Server Error
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error al borrar el hospital',
                    errors: err
                });
            }
            // Si no existe el hospital a buscar.
            if (!hospitalBorrado) {
                // 500 Internal Server Error
                return res.status(400).json({
                    ok: false,
                    mensaje: 'No existe un hospital con ese ID',
                    errors: {
                        message: 'No existe un hospital con ese ID'
                    }
                });
            }
            // Todo bien usuario borrado.
            res.status(200).json({
                ok: true,
                hospital: hospitalBorrado
            });
        });
    }

}