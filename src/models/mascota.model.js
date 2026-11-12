// El modelo solo ejecuta SQL, siempre con consultas parametrizadas ($1, $2...)
const pool = require('../config/db.js');

async function listarMascotas() {
  const r = await pool.query('SELECT * FROM mascotas ORDER BY id');
  return r.rows;
}

async function obtenerMascotaPorId(id) {
  const r = await pool.query('SELECT * FROM mascotas WHERE id = $1', [id]);
  return r.rows[0]; // undefined si no existe
}

async function crearMascota(m) {
  const r = await pool.query(
    `INSERT INTO mascotas (chip, nombre, especie, raza, edad, peso, telefono_dueno, hospitalizado)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
    [m.chip, m.nombre, m.especie, m.raza, m.edad, m.peso, m.telefono_dueno, m.hospitalizado]
  );
  return r.rows[0];
}

async function actualizarMascota(id, m) {
  const r = await pool.query(
    `UPDATE mascotas
     SET chip = $1, nombre = $2, especie = $3, raza = $4, edad = $5,
         peso = $6, telefono_dueno = $7, hospitalizado = $8
     WHERE id = $9 RETURNING *`,
    [m.chip, m.nombre, m.especie, m.raza, m.edad, m.peso, m.telefono_dueno, m.hospitalizado, id]
  );
  return r.rows[0]; // undefined si el id no existe
}

async function eliminarMascota(id) {
  const r = await pool.query('DELETE FROM mascotas WHERE id = $1', [id]);
  return r.rowCount; // 1 si se eliminó, 0 si no existía
}

module.exports = {
  listarMascotas,
  obtenerMascotaPorId,
  crearMascota,
  actualizarMascota,
  eliminarMascota,
};
