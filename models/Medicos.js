var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var medicoSchema = new Schema({
    nombre: {
        type: String,
        required: [true, 'El nombre es necesario']
    },
    img: {
        type: String,
        required: false
    },
    usuarioId: {
        type: Schema.Types.ObjectId,
        ref: 'Usuarios',
        required: true
    },
    hospitalId: {
        type: Schema.Types.ObjectId,
        ref: 'Hospitales',
        required: [true, 'El id hospital es un campo obligatorio']
    }
});
module.exports = mongoose.model('Medicos', medicoSchema);