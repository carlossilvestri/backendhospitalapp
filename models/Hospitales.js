const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const hospitalSchema = new Schema({
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
        ref: 'Usuarios'
    }
}, {
    collection: 'hospitales'
});
module.exports = mongoose.model('Hospitales', hospitalSchema);