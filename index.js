// 1. Cargar las variables de entorno del archivo .env
require('dotenv').config();

// 2. Llamar a la aplicación de Express
const app = require('./src/app.js');

// 3. Encender el servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor de la veterinaria listo en el puerto ${PORT}`);
});
