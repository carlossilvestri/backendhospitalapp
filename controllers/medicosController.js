const Medicos = require("../models/Medicos");
const bcrypt = require("bcrypt");
require('dotenv').config({
    path: 'variables.env'
});

// ==========================================
// Crear un nuevo medico: POST - /medico Params: token (usuarioId). Body: nombre, hospitalId (Obligatorios)
// ==========================================
exports.registrarMedico = async (req, res) => {
    const body = req.body;
    const usuario = req.usuario; // Al tener el token puedo tener acceso a req.usuario
    // Verificar que se envie los campos obligatorios (nombre, email, hospitalId)
    if (!body.nombre || !usuario || !body.hospitalId) {
        // Accion prohibida. (Error)
        return res.status(403).json({
            ok: false,
            mensaje: 'Faltan campos obligatorios. Revisar el nombre, hospitalId y el token del usuario.'
        });
    } else {
        const {
            nombre,
            img
        } = body;
        const usuarioId = usuario._id;
        const hospitalId = body.hospitalId;
        // Hay datos, crear el objeto medicos.
        const medico = new Medicos({
            nombre,
            usuarioId,
            hospitalId,
            img,
        });
        medico.save((err, medicoGuardado) => {
            // Si hay algun otro error entonces mostrarlo al usuario
            if (err) {
                // 400 Bad request.
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al crear medico',
                    errors: err
                });
            }
            // Todo bien. 201 creado
            res.status(201).json({
                ok: true,
                medico: medicoGuardado,
                usuariotoken: req.usuario
            });
        });
    }
}
// ==========================================
// Obtiene todos los Medicos: GET /medico 
// ==========================================
exports.mostrarMedicos = async (req, res, next) => {
    var desde = req.query.desde || 0;
    desde = Number(desde);
    // Encontra todos los medicos. 
    Medicos.find({}) // valores que me interesa obtener.
        .populate('usuarioId', 'nombre email')
        .populate('hospitalId')
        .skip(desde)
        .limit(10) // Envia/Muestra  10 registros
        .exec(
            (err, medicos) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error cargando medicos',
                        errors: err
                    });
                }
                Medicos.countDocuments({}, (err2, conteo) => {
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
                        medicos
                    });
                });
            }
        );
}
// ==========================================
// Obtiene un Medico en especifico: GET /medico/:id 
// ==========================================
exports.mostrarMedicoPorId = async (req, res, next) => {
    const id = req.params.id;
    if (!id){
        return res.status(500).json({
            ok: false,
            mensaje: 'Debe proporcionar un id',
            errors: err
        });
    }
    // Encontra el medico
    await Medicos.findById(id)
        .populate('usuarioId', 'nombre img email')
        .populate('hospitalId')
        .exec(
            (err, medico) => {
                if (!medico){
                    return res.status(400).json({
                        ok: false,
                        mensaje: `El medico con el id ${id} no existe`,
                        errors: { message: `No existe un medico con el id ${id}`}
                    });
                }
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error cargando el medico',
                        errors: err
                    });
                }
                res.status(200).json({
                    ok: true,
                    medico
                });
            }
        );
}

// ==========================================
// Actualizar medico. PUT /medico/:id Params: id, token. Body: nombre, hospitalId.
// ==========================================
exports.actualizarMedico = async (req, res) => {

    const id = req.params.id;
    const body = req.body;
    const usuario = req.usuario; // Al tener el token puedo tener acceso a req.usuario
    // Verificar que se envie los campos obligatorios (nombre, hospitalId)
    if (!body.nombre || !id || !usuario || !body.hospitalId) {
        // Accion prohibida. (Error)
        return res.status(403).json({
            ok: false,
            mensaje: 'Faltan campos obligatorios. Revisar el nombre, hospitalId y el token.'
        });
    } else {
        // Hay datos. Buscar el medico a actualizar.
        Medicos.findById(id, (err, medico) => {
            // Si hay errores como por ejm. no se consiguio el medico entonces mostrar notificacion.
            if (err) {
                // Error 500 Internal Server Error.
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error al buscar al o el medico',
                    errors: err
                });
            }
            // Si no se consiguio al medico entonces:
            if (!medico) {
                // 400 Bad request
                return res.status(400).json({
                    ok: false,
                    mensaje: 'El/La medico con el id ' + id + ' no existe',
                    errors: {
                        message: 'No existe un medico con ese ID'
                    }
                });
            }
            // Se actualiza los datos: 
            medico.nombre = body.nombre;
            medico.usuarioId = req.usuario._id;
            medico.hospitalId = body.hospitalId;
            // La img del medico es opcional. Si existe entonces guardarla
            if (body.img) {
                medico.img = body.img;
            }

            // Finalmente guardar en la BD.
            medico.save((err, medicoGuardado) => {

                if (err) {
                    // 400 Bad request
                    return res.status(400).json({
                        ok: false,
                        mensaje: 'Error al actualizar medico',
                        errors: err
                    });
                }

                res.status(200).json({
                    ok: true,
                    medico: medicoGuardado
                });

            });

        });
    }

};
// ==========================================
// Borra un usuario por su id: DELETE /medico/:id
// ==========================================
exports.borrarMedico = async (req, res, next) => {
    const id = req.params.id;
    // Verificar que el id no este vacio
    if (!id) {
        // Accion prohibida. (Error)
        return res.status(403).json({
            ok: false,
            mensaje: 'El id del medico es obligatorio'
        });
    } else {
        // Existe el id, intentar borrar el usuario.
        Medicos.findByIdAndRemove(id, (err, medicoBorrado) => {
            // Si hay algun error del servidor
            if (err) {
                // 500 Internal Server Error
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error al borrar el medico',
                    errors: err
                });
            }
            // Si no existe el medico a buscar.
            if (!medicoBorrado) {
                // 500 Internal Server Error
                return res.status(400).json({
                    ok: false,
                    mensaje: 'No existe un medico con ese ID',
                    errors: {
                        message: 'No existe un medico con ese ID'
                    }
                });
            }
            // Todo bien medico borrado.
            res.status(200).json({
                ok: true,
                medico: medicoBorrado
            });
        });
    }

}