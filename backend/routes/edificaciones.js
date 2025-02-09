const express = require('express');
const router = express.Router();
const { Edificacion } = require('../models'); // Importamos solo la parte de Edificacion

router.get('/', async (req, res) => {
    const edificaciones = await Edificacion.find();
    res.json(edificaciones);
});

router.post('/', async (req, res) => {
    const nuevaEdificacion = new Edificacion(req.body);
    await nuevaEdificacion.save();
    res.json(nuevaEdificacion);
});

router.put('/:id', async (req, res) => {
    const edificacion = await Edificacion.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(edificacion);
});

router.delete('/:id', async (req, res) => {
    await Edificacion.findByIdAndDelete(req.params.id);
    res.json({ message: 'Eliminado' });
});

module.exports = router;
