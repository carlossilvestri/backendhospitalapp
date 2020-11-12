const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Usuarios = require("../models/Usuarios");
require('dotenv').config({
    path: 'variables.env'
});
const {
    OAuth2Client
} = require('google-auth-library');
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
// ==========================================
// Autenticacion de Google: POST - /google Params: idToken.
// ==========================================
async function verify(token) {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: process.env.GOOGLE_CLIENT_ID, // Specify the CLIENT_ID of the app that accesses the backend
        // Or, if multiple clients access the backend:
        //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
    });
    const payload = ticket.getPayload();
    // const userid = payload['sub'];
    // If request specified a G Suite domain:
    // const domain = payload['hd'];
    return {
        nombre: payload.name,
        email: payload.email,
        img: payload.picture,
        google: true
    }
}
exports.autenticacionGoogle = async (req, res) => {
    const idToken = req.body.idToken;
    const googleUser = await verify(idToken)
        .catch(err => {
            return res.status(403).json({
                ok: false,
                mensaje: 'Token no valido'
            });
        });
    Usuarios.findOne({
        email: googleUser.email
    }, (err, usuarioDB) => {
        // Si hay algun otro error entonces mostrarlo al usuario
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar usuario',
                errors: err
            });
        }
        // Si el usuario existe.
        if (usuarioDB) {
            // Si un usuario intenta iniciar sesion con Google pero ya estaba registrado normalmente entonces:
            if (!usuarioDB.google) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Debe de usar su autenticacion normal'
                });
            } else {
                // El usuario ya se habia registrado con Google anteriormente, todo bien.
                // Crea un token
                const token = jwt.sign({
                    usuario: usuarioDB
                }, process.env.SEED_JSON_WEB_TOKEN, {
                    expiresIn: 14400 // 4 horas - 14400 milisegundos
                });
                // No mandar el password.
                usuarioDB.password = ':)';
                res.status(200).json({
                    ok: true,
                    usuario: usuarioDB,
                    token,
                    id: usuarioDB._id,
                    menu: obtenerMenu(usuarioDB.role)
                });
            }
        } else {
            // El usuario no existe, hay que crearlo.
            const usuario = new Usuarios();
            usuario.nombre = googleUser.nombre;
            usuario.email = googleUser.email;
            usuario.img = googleUser.img;
            usuario.google = true;
            usuario.password = ':)';

            usuario.save((err, usuarioDB) => {
                // Crea un token
                const token = jwt.sign({
                    usuario: usuarioDB
                }, process.env.SEED_JSON_WEB_TOKEN, {
                    expiresIn: 14400 // 4 horas - 14400 milisegundos
                });
                // No mandar el password.
                if (usuarioDB.password) {
                    usuarioDB.password = ':)';
                }
                res.status(200).json({
                    ok: true,
                    usuario: usuarioDB,
                    token,
                    id: usuarioDB._id,
                    menu: obtenerMenu(usuarioDB.role)
                });
            })



        }
    })
}
// Regresar un objeto con el menu que se utilizara en el frontend.
/*
Params: role (string) ADMIN_ROLE 
*/
function obtenerMenu(role){
    let menu= [
        {
          titulo: 'Principal',
          icono: 'md mdi-gauge',
          submenu: [
            { titulo: 'Dashboard', url: '/dashboard'},
            { titulo: 'ProgressBar', url: '/progress'},
            { titulo: 'Gráficas', url: '/graficas1'},
            { titulo: 'Promesas', url: '/promesas'},
            { titulo: 'RxJs', url: '/rxjs'},
          ]
        },
        {
          titulo: 'Mantenimiento',
          icono: 'md mdi-folder-lock-open',
          submenu: [
            // { titulo: 'Usuarios', url: '/usuarios'},
            { titulo: 'Hospitales', url: '/hospitales'},
            { titulo: 'Médicos', url: '/medicos'}
          ]
        }
      ];
      if (role === 'ADMIN_ROLE'){
          menu[1].submenu.unshift({ titulo: 'Usuarios', url: '/usuarios'});
      }
    return menu;
}