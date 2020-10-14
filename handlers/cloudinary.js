require('dotenv').config({ path: 'variables.env' })
var cloudinary = require('cloudinary').v2

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

exports.eliminarCloudinary = async publicid => {
    const resultado = {}
    try {
        await cloudinary.uploader.destroy(publicid)
        resultado.ok = true
        resultado.message = 'La imagen se borró correctamente'
    } catch (e) {
        resultado.ok = false
        resultado.message = 'Ha ocurrido un error al eliminar la imagen'
    }
    return resultado
}
exports.subirACloudinary = (res, req, next) => {
    cloudinary.uploader.upload("my_image.jpg", function(error, result) {
        console.log(result, error);
        res.send({
            success: true,
            result
        })
    });
}