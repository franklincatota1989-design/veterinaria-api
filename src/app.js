// 1. Llamar a Express
const express = require('express');

// 2. Llamar a las rutas de mascotas
const mascotasRoutes = require('./routes/mascotas.routes.js');

// 3. Crear la aplicación y permitir leer JSON en el body
const app = express();
app.use(express.json());

// 4. Rutas de la API
app.use('/api/mascotas', mascotasRoutes);

// 5. Ruta no encontrada
app.use((req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

// 6. Manejo de errores (JSON mal escrito → 400, cualquier otro → 500)
app.use((err, req, res, next) => {
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'El body no es un JSON válido' });
  }
  console.error(err.stack);
  res.status(500).json({ error: 'Error interno del servidor' });
});

// 7. Exportar la aplicación para usarla en index.js
module.exports = app;
