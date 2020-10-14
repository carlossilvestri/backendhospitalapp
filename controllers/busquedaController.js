const Hospitales = require("../models/Hospitales");
const Medicos = require("../models/Medicos");
const Usuarios = require("../models/Usuarios");

// ==========================================
// Obtiene una busqueda general. Busqueda: GET /busqueda/todo/:busqueda
// ==========================================
exports.busquedaGeneral = async (req, res, next) => {
    const busqueda = req.params.busqueda;
    const regex = new RegExp(busqueda, 'i'); // i de insensible a las mayusculas y minusculas.
    // Obtener los desde (si hay) para mostrar los resultados
    let desdeH = req.query.desdeH || 0,
        desdeM = req.query.desdeM || 0,
        desdeU = req.query.desdeU || 0;
    desdeH = Number(desdeH);
    desdeM = Number(desdeM);
    desdeU = Number(desdeU);
    await Promise.all([buscarHospitales(desdeH, regex), buscarMedicos(desdeM, regex), buscarUsuarios(desdeU, regex)])
        .then(respuestas => {
            res.status(200).json({
                ok: true,
                hospitales: respuestas[0],
                medicos: respuestas[1],
                usuarios: respuestas[2]
            });
        }).catch(err => {
            console.log(err);
        })
}
// ==========================================
// Obtiene una busqueda en una coleccion especifica. Busqueda: GET /busqueda/coleccion/:tabla/:busqueda
// ==========================================
exports.busquedaPorColeccion = async (req, res, next) => {
    const busqueda = req.params.busqueda;
    const tabla = req.params.tabla;
    const regex = new RegExp(busqueda, 'i'); // i de insensible a las mayusculas y minusculas.
    // Obtener los desde (si hay) para mostrar los resultados
    let promesa;
    let desdeH = req.query.desdeH || 0,
        desdeM = req.query.desdeM || 0,
        desdeU = req.query.desdeU || 0;
    desdeH = Number(desdeH);
    desdeM = Number(desdeM);
    desdeU = Number(desdeU);
    switch (tabla) {
        case 'usuarios':
            promesa = buscarUsuarios(desdeU, regex);
            break;
        case 'medicos':
            promesa = buscarMedicos(desdeM, regex);
            break;
        case 'hospitales':
            promesa = buscarHospitales(desdeH, regex);
            break;
        default:
            // 400 Error
            return res.status(400).json({
                ok: false,
                mensaje: 'Los tipos de busqueda solo son: usuarios, medicos y hospitales.',
                error: {
                    mensaje: 'Tipo de tabla/coleccion no valida.'
                }
            });
    }
    await promesa.then(data => {
        // 200 Bien
        return res.status(200).json({
            ok: true,
            [tabla]: data
        });
    })
}

function buscarHospitales(desdeH, regex) {
    // Si desdeH viene como NaN o null entonces asignarle un valor.
    if (!desdeH) {
        desdeH = 0;
    }
    return new Promise((resolve, reject) => {
        Hospitales.find({
                nombre: regex
            })
            .skip(desdeH)
            .limit(10) // Envia/Muestra 10
            .populate('usuarioId', 'nombre email')
            .exec((err, hospitales) => {
                if (err) {
                    reject('Error al cargar los hospitales.', err);
                } else {
                    resolve(hospitales);
                }
            });
    });
}

function buscarMedicos(desdeM, regex) {
    // Si desdeH viene como NaN o null entonces asignarle un valor.
    if (!desdeM) {
        desdeM = 0;
    }
    return new Promise((resolve, reject) => {
        Medicos.find({
                nombre: regex
            })
            .skip(desdeM)
            .limit(10) // Envia/Muestra 10
            .populate('usuarioId', 'nombre email')
            .populate('hospitalId')
            .exec((err, medicos) => {
                if (err) {
                    reject('Error al cargar los medicos.', err);
                } else {
                    resolve(medicos);
                }
            });
    });
}

function buscarUsuarios(desdeU, regex) {
    // Si desdeH viene como NaN o null entonces asignarle un valor.
    if (!desdeU) {
        desdeU = 0;
    }
    return new Promise((resolve, reject) => {
        Usuarios.find({}, 'nombre email role')
            .or([{
                'nombre': regex
            }, {
                'email': regex
            }])
            .skip(desdeU)
            .limit(10) // Envia/Muestra 10
            .exec((err, usuarios) => {
                if (err) {
                    reject('Error al buscar el usuario ', err);
                } else {
                    resolve(usuarios);
                }
            })
    });
}