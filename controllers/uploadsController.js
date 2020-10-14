const fs = require('fs');
const Hospitales = require('../models/Hospitales');
const Medicos = require('../models/Medicos');
const Usuarios = require('../models/Usuarios');
const path = require('path');

/*
Cambia/Agrega una imagen a un determinado medico, usuario y hospital.
Params: token. (Obligatorio)
Body: (form-data) imagen ('png', 'jpg', 'gif', 'jpeg')
PUT - Cambia/Agrega /upload/:coleccion/:id
*/
exports.uploadImg = async (req, res, next) => {
    const tipo = req.params.coleccion;
    const id = req.params.id;
    // Tipos de coleccion
    const tiposValidos = ['hospitales', 'medicos', 'usuarios'];
    if (tiposValidos.indexOf(tipo) < 0) {
        return res.status(400).json({
            ok: false,
            mensaje: 'Tipo de coleccion/tipo no valido.',
            errors: {
                message: 'Tipo de coleccion/tipo no valido.'
            }
        });
    }
    // Si no hay foto
    if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).json({
            ok: false,
            mensaje: 'No files were uploaded.',
            errors: {
                message: 'No files were uploaded.'
            }
        });
    }
    // Si el archivo pesa mas de 2mb entonces.
    if (req.files.imagen.truncated) {
        // 400 Error
        return res.status(400).json({
            ok: false,
            mensaje: 'Archivo muy pesado.',
            errors: {
                message: 'El archivo debe ser menor a 2mb'
            }
        });
    }
    // Obtener nombre del archivo.
    const archivo = req.files.imagen;
    const nombreCortado = archivo.name.split('.');
    const extensionArchivo = nombreCortado[nombreCortado.length - 1];
    // Solo estas extensiones son admitidas.
    const extensionesValidas = ['png', 'jpg', 'gif', 'jpeg'];
    // Si regresa -1 es porque la extension no se encontro en el array
    if (extensionesValidas.indexOf(extensionArchivo) < 0) {
        return res.status(400).json({
            ok: false,
            mensaje: 'Extension no valida.',
            errors: {
                message: 'Las extensiones validas son ' + extensionesValidas.join(', ')
            }
        });
    }
    // Nombre de archivo personalizado por idUsuario-numeroAlAzar.extension
    const nombreArchivo = `${ id }-${ new Date().getMilliseconds()}.${extensionArchivo}`;
    // Mover el archivo del temporal a un path.
    const path = `./uploads/${tipo}/${nombreArchivo}`;
    archivo.mv(path, err => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al mover el archivo.',
                errors: err
            });
        }
    });
    subirPorTipo(tipo, id, nombreArchivo, res);
    // res.status(200).json({
    //     ok: true,
    //     funciona: 'Archivo movido',
    //     nombreCortado,
    //     extensionArchivo
    // });
}
/*
GET - Obtener img. /upload/:coleccion/:img
*/
exports.obtenerImagen = async (req, res, next) => {
    const tipo = req.params.coleccion;
    const img = req.params.img;
    const pathImagen = path.resolve(__dirname, `../uploads/${tipo}/${img}`);
    const tiposValidos = ['hospitales', 'medicos', 'usuarios'];
    // Si el usuario ingreso una coleccion no valida entonces
    if (tiposValidos.indexOf(tipo) < 0) {
        return res.status(400).json({
            ok: false,
            mensaje: 'Tipo de coleccion/tipo no valido.',
            errors: {
                message: 'Tipo de coleccion/tipo no valido.'
            }
        });
    }
    // Si la img existe
    if (fs.existsSync(pathImagen)) {
        res.sendFile(pathImagen);
    } else {
        const pathNoImage = path.resolve(__dirname, '../assets/img/no-image.jpg');
        res.sendFile(pathNoImage);
    }
}

function subirPorTipo(tipo, id, nombreArchivo, res) {

    if (tipo === 'usuarios') {

        Usuarios.findById(id, (err, usuario) => {

            if (!usuario) {
                return res.status(400).json({
                    ok: true,
                    mensaje: 'Usuario no existe',
                    errors: {
                        message: 'Usuario no existe'
                    }
                });
            }


            var pathViejo = './uploads/usuarios/' + usuario.img;

            // Si existe, elimina la imagen anterior
            if (fs.existsSync(pathViejo)) {
                fs.unlink(pathViejo, (error) => {
                    if (error) {
                        console.log(error);
                    }
                    return;
                });
            }

            usuario.img = nombreArchivo;

            usuario.save((err, usuarioActualizado) => {

                usuarioActualizado.password = ':)';

                return res.status(200).json({
                    ok: true,
                    mensaje: 'Imagen de usuario actualizada',
                    usuario: usuarioActualizado
                });

            })


        });

    }

    if (tipo === 'medicos') {

        Medicos.findById(id, (err, medico) => {

            if (!medico) {
                return res.status(400).json({
                    ok: true,
                    mensaje: 'Médico no existe',
                    errors: {
                        message: 'Médico no existe'
                    }
                });
            }

            var pathViejo = './uploads/medicos/' + medico.img;

            // Si existe, elimina la imagen anterior
            if (fs.existsSync(pathViejo)) {
                fs.unlink(pathViejo, (error) => {
                    if (error) {
                        console.log(error);
                    }
                    return;
                });
            }

            medico.img = nombreArchivo;

            medico.save((err, medicoActualizado) => {

                return res.status(200).json({
                    ok: true,
                    mensaje: 'Imagen de médico actualizada',
                    usuario: medicoActualizado
                });

            })

        });
    }

    if (tipo === 'hospitales') {

        Hospitales.findById(id, (err, hospital) => {

            if (!hospital) {
                return res.status(400).json({
                    ok: true,
                    mensaje: 'Hospital no existe',
                    errors: {
                        message: 'Hospital no existe'
                    }
                });
            }

            var pathViejo = './uploads/hospitales/' + hospital.img;

            // Si existe, elimina la imagen anterior
            if (fs.existsSync(pathViejo)) {
                fs.unlink(pathViejo, (error) => {
                    if (error) {
                        console.log(error);
                    }
                    return;
                });
            }

            hospital.img = nombreArchivo;

            hospital.save((err, hospitalActualizado) => {

                return res.status(200).json({
                    ok: true,
                    mensaje: 'Imagen de hospital actualizada',
                    usuario: hospitalActualizado
                });

            })

        });
    }


}