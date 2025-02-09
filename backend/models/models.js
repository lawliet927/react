const mongoose = require('mongoose');

// 📌 Modelo de Edificación
const EdificacionSchema = new mongoose.Schema({
    nombre: { type: String, required: true },
    direccion: { type: String, required: true },
    tipo: { type: String, required: true },
    estado: { type: String, enum: ['En construcción', 'Terminado'], required: true },
});
const Edificacion = mongoose.model('Edificacion', EdificacionSchema);

// 📌 Modelo de Tienda
const TiendaSchema = new mongoose.Schema({
    nombre: { type: String, required: true },
    edificacion: { type: mongoose.Schema.Types.ObjectId, ref: 'Edificacion', required: true },
    rubro: { type: String, required: true },
});
const Tienda = mongoose.model('Tienda', TiendaSchema);

// 📌 Modelo de Propietario (con subida de fotos)
const PropietarioSchema = new mongoose.Schema({
    nombre: { type: String, required: true },
    telefono: { type: String, required: true },
    email: { type: String, required: true },
    foto: { type: String }, // Aquí se almacenará la URL de la imagen
});
const Propietario = mongoose.model('Propietario', PropietarioSchema);

// 📌 Modelo de Fechas de Entrega
const FechaEntregaSchema = new mongoose.Schema({
    tienda: { type: mongoose.Schema.Types.ObjectId, ref: 'Tienda', required: true },
    fecha: { type: Date, required: true },
});
const FechaEntrega = mongoose.model('FechaEntrega', FechaEntregaSchema);

module.exports = { Edificacion, Tienda, Propietario, FechaEntrega };
