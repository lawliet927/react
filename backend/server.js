const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configuración de variables de entorno
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

// 📌 Verificar si la carpeta uploads existe, si no, crearla
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir);
}

// 📌 Configuración de subida de imágenes con Multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Carpeta donde se guardarán las imágenes
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // Nombre único
    }
});
const upload = multer({ storage });

// 📌 Conexión a MongoDB
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log("✅ MongoDB Conectado"))
.catch(err => console.error("❌ Error de conexión a MongoDB:", err));

// 📌 Servir imágenes de la carpeta uploads
app.use('/uploads', express.static('uploads'));

// 📌 Importar modelos correctamente
const { Edificacion, Tienda, Propietario, FechaEntrega } = require('./models/models');

// 📌 Rutas CRUD con manejo de errores

// 🔹 Rutas para Edificaciones
app.get('/api/edificaciones', async (req, res) => {
    try {
        const edificaciones = await Edificacion.find();
        res.json(edificaciones);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener edificaciones' });
    }
});

app.post('/api/edificaciones', async (req, res) => {
    try {
        const nuevaEdificacion = new Edificacion(req.body);
        await nuevaEdificacion.save();
        res.json(nuevaEdificacion);
    } catch (error) {
        res.status(400).json({ error: 'Error al crear edificación' });
    }
});

app.put('/api/edificaciones/:id', async (req, res) => {
    try {
        const edificacion = await Edificacion.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!edificacion) return res.status(404).json({ error: 'Edificación no encontrada' });
        res.json(edificacion);
    } catch (error) {
        res.status(500).json({ error: 'Error al actualizar edificación' });
    }
});

app.delete('/api/edificaciones/:id', async (req, res) => {
    try {
        const edificacion = await Edificacion.findByIdAndDelete(req.params.id);
        if (!edificacion) return res.status(404).json({ error: 'Edificación no encontrada' });
        res.json({ message: 'Edificación eliminada' });
    } catch (error) {
        res.status(500).json({ error: 'Error al eliminar edificación' });
    }
});

// 🔹 Rutas para Tiendas
app.get('/api/tiendas', async (req, res) => {
    try {
        const tiendas = await Tienda.find().populate('edificacion');
        res.json(tiendas);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener tiendas' });
    }
});

app.post('/api/tiendas', async (req, res) => {
    try {
        const nuevaTienda = new Tienda(req.body);
        await nuevaTienda.save();
        res.json(nuevaTienda);
    } catch (error) {
        res.status(400).json({ error: 'Error al crear tienda' });
    }
});

app.put('/api/tiendas/:id', async (req, res) => {
    try {
        const tienda = await Tienda.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!tienda) return res.status(404).json({ error: 'Tienda no encontrada' });
        res.json(tienda);
    } catch (error) {
        res.status(500).json({ error: 'Error al actualizar tienda' });
    }
});

app.delete('/api/tiendas/:id', async (req, res) => {
    try {
        const tienda = await Tienda.findByIdAndDelete(req.params.id);
        if (!tienda) return res.status(404).json({ error: 'Tienda no encontrada' });
        res.json({ message: 'Tienda eliminada' });
    } catch (error) {
        res.status(500).json({ error: 'Error al eliminar tienda' });
    }
});

// 🔹 Rutas para Propietarios
app.get('/api/propietarios', async (req, res) => {
    try {
        const propietarios = await Propietario.find();
        res.json(propietarios);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener propietarios' });
    }
});

app.post('/api/propietarios', upload.single('foto'), async (req, res) => {
    try {
        const nuevoPropietario = new Propietario({
            nombre: req.body.nombre,
            telefono: req.body.telefono,
            email: req.body.email,
            foto: req.file ? `/uploads/${req.file.filename}` : null,
        });
        await nuevoPropietario.save();
        res.json(nuevoPropietario);
    } catch (error) {
        res.status(400).json({ error: 'Error al crear propietario' });
    }
});

app.put('/api/propietarios/:id', upload.single('foto'), async (req, res) => {
    try {
        const propietario = await Propietario.findById(req.params.id);
        if (!propietario) return res.status(404).json({ error: 'Propietario no encontrado' });

        propietario.nombre = req.body.nombre || propietario.nombre;
        propietario.telefono = req.body.telefono || propietario.telefono;
        propietario.email = req.body.email || propietario.email;
        if (req.file) propietario.foto = `/uploads/${req.file.filename}`;

        await propietario.save();
        res.json(propietario);
    } catch (error) {
        res.status(500).json({ error: 'Error al actualizar propietario' });
    }
});

app.delete('/api/propietarios/:id', async (req, res) => {
    try {
        const propietario = await Propietario.findByIdAndDelete(req.params.id);
        if (!propietario) return res.status(404).json({ error: 'Propietario no encontrado' });
        res.json({ message: 'Propietario eliminado' });
    } catch (error) {
        res.status(500).json({ error: 'Error al eliminar propietario' });
    }
});

// 📌 Agregar rutas CRUD para Fechas de Entrega
app.get('/api/fechasEntrega', async (req, res) => {
    try {
        const fechas = await FechaEntrega.find().populate('tienda'); // Traer con la info de la tienda
        res.json(fechas);
    } catch (error) {
        console.error("Error al obtener fechas de entrega:", error);
        res.status(500).json({ error: 'Error al obtener fechas de entrega' });
    }
});
// fecha entrega
app.post('/api/fechasEntrega', async (req, res) => {
    try {
        const nuevaFecha = new FechaEntrega({
            tienda: req.body.tienda,
            fecha: req.body.fecha
        });
        await nuevaFecha.save();
        res.json(nuevaFecha);
    } catch (error) {
        console.error("Error al crear fecha de entrega:", error);
        res.status(400).json({ error: 'Error al crear fecha de entrega' });
    }
});

app.put('/api/fechasEntrega/:id', async (req, res) => {
    try {
        const fechaEntrega = await FechaEntrega.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!fechaEntrega) return res.status(404).json({ error: 'Fecha de entrega no encontrada' });
        res.json(fechaEntrega);
    } catch (error) {
        console.error("Error al actualizar fecha de entrega:", error);
        res.status(500).json({ error: 'Error al actualizar fecha de entrega' });
    }
});

app.delete('/api/fechasEntrega/:id', async (req, res) => {
    try {
        const fechaEntrega = await FechaEntrega.findByIdAndDelete(req.params.id);
        if (!fechaEntrega) return res.status(404).json({ error: 'Fecha de entrega no encontrada' });
        res.json({ message: 'Fecha de entrega eliminada' });
    } catch (error) {
        console.error("Error al eliminar fecha de entrega:", error);
        res.status(500).json({ error: 'Error al eliminar fecha de entrega' });
    }
});



// 📌 Ruta principal
app.get('/', (req, res) => {
    res.send('✅ API funcionando');
});

// 📌 Iniciar el servidor
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});
