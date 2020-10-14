const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const uniqueValidator = require("mongoose-unique-validator");

const rolesValidaos = {
    values: ['ADMIN_ROLE', 'USER_ROLE'],
    message: '{VALUE} no es un rol permitido'
};

const usuariosSchema = new Schema({
    nombre: {
        type: String,
        trim: true,
        required: [true, 'El nombre es necesario']
    },
    email: {
        type: String,
        trim: true,
        lowercase: true,
        unique: true,
        required: [true, 'El email es necesario']
    },
    password: {
        type: String,
        required: [true, 'La contraseña es necesaria.']
    },
    img: {
        type: String,
        required: false
    },
    role: {
        type: String,
        required: true,
        default: 'USER_ROLE',
        enum: rolesValidaos
    }
});
usuariosSchema.plugin(uniqueValidator, {
    message: '{PATH} debe de ser unico.'
})
module.exports = mongoose.model('Usuarios', usuariosSchema);