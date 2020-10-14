const Usuarios = require("../models/Usuarios");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
require('dotenv').config({
    path: 'variables.env'
});

// ==========================================
// Crear un nuevo usuario: POST - /usuario Params: nombre, email, password
// ==========================================
exports.registrarUsuario = async (req, res) => {
    const body = req.body;
    // Verificar que se envie los campos obligatorios (nombre, email, password)
    if (!body.nombre || !body.email || !body.password) {
        // Accion prohibida. (Error)
        return res.status(403).json({
            ok: false,
            mensaje: 'Faltan campos obligatorios. Revisar el nombre, email y password.'
        });
    } else {
        // Hay datos, crear el objeto usuarios.
        const usuario = new Usuarios({
            nombre: body.nombre,
            email: body.email,
            password: bcrypt.hashSync(body.password, 10),
            img: body.img,
            role: body.role
        });
        usuario.save((err, usuarioGuardado) => {
            // Si hay algun otro error entonces mostrarlo al usuario
            if (err) {
                // 400 Bad request.
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al crear usuario',
                    errors: err
                });
            }
            // Todo bien. 201 creado
            res.status(201).json({
                ok: true,
                usuario: usuarioGuardado,
                usuariotoken: req.usuario
            });
        });
    }
}
// ==========================================
// Actualizar usuario
// ==========================================
exports.actualizarUsuario = async (req, res) => {

    var id = req.params.id;
    var body = req.body;
    // Verificar que se envie los campos obligatorios (nombre, email, password)
    if (!body.nombre || !body.email || !body.password) {
        // Accion prohibida. (Error)
        return res.status(403).json({
            ok: false,
            mensaje: 'Faltan campos obligatorios. Revisar el nombre, email y password.'
        });
    } else {
        // Hay datos. Buscar el usuario a actualizar.
        Usuarios.findById(id, (err, usuario) => {
            // Si hay errores como por ejm. no se consiguio el usuario entonces mostrar notificacion.
            if (err) {
                // Error 500 Internal Server Error.
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error al buscar usuario',
                    errors: err
                });
            }
            // Si no se consiguio al usuario entonces:
            if (!usuario) {
                // 400 Bad request
                return res.status(400).json({
                    ok: false,
                    mensaje: 'El usuario con el id ' + id + ' no existe',
                    errors: {
                        message: 'No existe un usuario con ese ID'
                    }
                });
            }

            // Se actualizan: (El role y el password no estan incluidos).
            usuario.nombre = body.nombre;
            usuario.email = body.email;
            usuario.role = body.role;
            // Finalmente guardar en la BD.
            usuario.save((err, usuarioGuardado) => {

                if (err) {
                    // 400 Bad request
                    return res.status(400).json({
                        ok: false,
                        mensaje: 'Error al actualizar usuario',
                        errors: err
                    });
                }
                usuarioGuardado.password = ':)';

                res.status(200).json({
                    ok: true,
                    usuario: usuarioGuardado
                });

            });

        });
    }

};
// Encontra todos los usuarios
exports.mostrarUsuarios = async (req, res, next) => {
    var desde = req.query.desde || 0;
    desde = Number(desde);
    // Encontra todos los usuarios. 
    Usuarios.find({}, 'nombre email img role') // valores que me interesa obtener.
        .skip(desde)
        .limit(5) // Envia/Muestra  5 registros
        .exec(
            (err, usuarios) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error cargando usuarios',
                        errors: err
                    });
                }
                Usuarios.countDocuments({}, (err2, conteo) => {
                    if (err2) {
                        return res.status(500).json({
                            ok: false,
                            mensaje: 'Error contando los usuarios',
                            errors: err2
                        });
                    }
                    res.status(200).json({
                        ok: true,
                        total: conteo,
                        usuarios
                    });
                });
            }
        );
}
// Borra un usuario por su id: DELETE /usuario/:id
exports.borrarUsuario = async (req, res, next) => {
    const id = req.params.id;
    // Verificar que el id no este vacio
    if (!id) {
        // Accion prohibida. (Error)
        return res.status(403).json({
            ok: false,
            mensaje: 'El id es obligatorio'
        });
    } else {
        // Existe el id, intentar borrar el usuario.
        Usuarios.findByIdAndRemove(id, (err, usuarioBorrado) => {
            // Si hay algun error del servidor
            if (err) {
                // 500 Internal Server Error
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error al borrar el usuario',
                    errors: err
                });
            }
            // Si no existe el usuario a buscar.
            if (!usuarioBorrado) {
                // 500 Internal Server Error
                return res.status(400).json({
                    ok: false,
                    mensaje: 'No existe un usuario con ese ID',
                    errors: {
                        message: 'No existe un usuario con ese ID'
                    }
                });
            }
            // Todo bien usuario borrado.
            res.status(200).json({
                ok: true,
                usuario: usuarioBorrado
            });
        });
    }

}
// POST /login Logica del Login
exports.login = async (req, res, next) => {
    const body = req.body;
    // Verificar que se envie los campos obligatorios (email, password)
    if (!body.email || !body.password) {
        // Accion prohibida. (Error)
        return res.status(403).json({
            ok: false,
            mensaje: 'Faltan campos obligatorios. Revisar el nombre, email y password.'
        });
    } else {
        const {
            email,
            password
        } = body;
        await Usuarios.findOne({
            email
        }, (err, usuarioBD) => {
            // El usuario coloco algo en email y password, hacer mas validaciones/.
            // Si hay algun error del servidor
            if (err) {
                // 500 Internal Server Error
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error al buscar usuario',
                    errors: err
                });
            }
            // Si no existe un correo con ese email entonces.
            if (!usuarioBD) {
                // 400 
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Credenciales no validas - email'
                });
            }
            // Si el password no coinciden.
            if (!bcrypt.compareSync(password, usuarioBD.password)) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Credenciales no validas - password',
                    errors: err
                });
            }
            // Crea un token
            const token = jwt.sign({
                usuario: usuarioBD
            }, process.env.SEED_JSON_WEB_TOKEN, {
                expiresIn: 14400 // 4 horas - 14400 milisegundos
            });
            // No mandar el password.
            usuarioBD.password = ':)';
            res.status(200).json({
                ok: true,
                usuario: usuarioBD,
                token,
                id: usuarioBD._id
            });
        });
    }
}