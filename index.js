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

app.use(fileUpload());
/* Server index config. Sirve para ver las img de la carpeta uploads.
   Bueno para debuggear, pero malo para cuando se tenga ya en produccion.*/
// const serveIndex = require('serve-index');
// app.use(express.static(__dirname + '/'));
// app.use('/uploads', serveIndex(__dirname + '/uploads'));

//Definir un dominio(s) para recibir peticiones.
const whiteList = [process.env.FRONTEND_URL];
const corsOption = {
    origin: (origin, callback) => {
        //Revisar si la peticion viene de un servidor que esta en whitelist
        const existe = whiteList.some(dominio => dominio === origin);
        if (existe) {
            callback(null, true);
        } else {
            callback(new Error("No permitido por CORS."));
        }
    }
}
//Carpeta publica
app.use(express.static('uploads'));

//Habilitar cors
//app.use(cors(corsOption));

//Rutas de la app.
app.use('/', routes());



const host = process.env.HOST || '0.0.0.0';
const port = process.env.PORT || 5000;
app.listen(port, host, () => console.log(`El servidor funciona en el puerto ${port}`));