const jwt = require("jsonwebtoken");
require('dotenv').config({
    path: 'variables.env'
});

exports.verificarToken = (req, res, next) => {

    const token = req.query.token;

    jwt.verify(token, process.env.SEED_JSON_WEB_TOKEN, (err, decoded) => {
        // Si hay algun error del servidor
        if (err) {
            // 401 Unauthorized
            return res.status(401).json({
                ok: false,
                mensaje: 'Token incorrecto',
                errors: err
            });
        }
        req.usuario = decoded.usuario;
        next();
    });
}
/*

*/
module.exports.verificarAdmin = (req, res, next) => {

    const usuario = req.usuario;
    if (!usuario){
        return res.status(400).json({
            ok: false,
            mensaje: 'Debe proporcionar el id del usuario'
        });
    }
    if (usuario.role === 'ADMIN_ROLE') {
        next();
        return;
    } else {
        // 401 Unauthorized
        return res.status(401).json({
            ok: false,
            mensaje: 'Token incorrecto. No eres Administrador'
        });
    }
}
/*
    Params: /:id
    Permite que un usuario pueda actualizar su usuario pero obligatoriamente debe se
*/
module.exports.verificarAdminOMismiUsuario = (req, res, next) => {

    const usuario = req.usuario;
    const id = req.params.id;
    if (!usuario){
        return res.status(400).json({
            ok: false,
            mensaje: 'Debe proporcionar el id del usuario'
        });
    }
    if (usuario.role === 'ADMIN_ROLE' || usuario._id == id) {
        next();
        return;
    } else {
        // 401 Unauthorized
        return res.status(401).json({
            ok: false,
            mensaje: 'Token incorrecto. No eres Administrador o no es el mismo usuario.'
        });
    }
}