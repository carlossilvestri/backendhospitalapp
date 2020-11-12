const express = require('express');
const routes = require('./routes');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const fileUpload = require("express-fileupload");
//Cors permite que un cliente se conecte a otro servidor para el intercambio de recursos.
const cors = require("cors");
require('dotenv').config({
    path: 'variables.env'
});
//Crear el servidor.
const app = express();
//Conectar a MongoDB 
mongoose.Promise = global.Promise;
mongoose.connect(process.env.DB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true,

});
//Habilitar bodyParser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));
// 2097152 bytes = 2mb
app.use(fileUpload({
    limits: {
        fileSize: 2097152
    },
}));
/* Server index config. Sirve para ver las img de la carpeta uploads.
   Bueno para debuggear, pero malo para cuando se tenga ya en produccion.*/
// const serveIndex = require('serve-index');
// app.use(express.static(__dirname + '/'));
// app.use('/uploads', serveIndex(__dirname + '/uploads'));

// CORS
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header("Access-Control-Allow-Methods", "POST, GET, PUT, DELETE, OPTIONS");
    next();
});


//Rutas de la app.
app.use('/', routes());



const host = process.env.HOST || '0.0.0.0';
const port = process.env.PORT || 5000;
app.listen(port, host, () => console.log(`El servidor funciona en el puerto ${port}`));