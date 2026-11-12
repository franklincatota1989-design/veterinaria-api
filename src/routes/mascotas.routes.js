// 1. Importar Router de Express
const { Router } = require('express');

// 2. Importar el controlador de mascotas
const control = require('../controllers/mascotas.controller.js');

const router = Router();

// 3. Rutas del CRUD (el prefijo /api/mascotas se define en app.js)
router.get('/', control.listarMascotas);
router.get('/:id', control.obtenerMascotaPorId);
router.post('/', control.crearMascota);
router.put('/:id', control.actualizarMascota);
router.delete('/:id', control.eliminarMascota);

module.exports = router;
