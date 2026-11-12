// 1. Importar la librería pg
const { Pool } = require('pg');

// 2. Crear la conexión leyendo los datos desde process.env (archivo .env)
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: Number(process.env.DB_PORT),
});

// 3. Exportar la conexión para usarla en los modelos
module.exports = pool;
