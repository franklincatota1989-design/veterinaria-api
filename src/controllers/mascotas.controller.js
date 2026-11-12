// El controlador valida los datos y decide el código de respuesta HTTP
const mascota = require('../models/mascota.model.js');

// Peso máximo permitido (kg) según la especie: evita pesos imposibles
const PESO_MAXIMO = { Perro: 100, Gato: 15, Conejo: 10, Ave: 2 };

const esTexto = (v, max) => typeof v === 'string' && v.trim() !== '' && v.trim().length <= max;
const idValido = (id) => /^\d+$/.test(id) && Number(id) > 0;

// Devuelve un arreglo con los errores encontrados (vacío si todo está bien)
function validarMascota(d) {
  const errores = [];

  if (typeof d.chip !== 'string' || !/^\d{15}$/.test(d.chip)) {
    errores.push('El chip debe tener exactamente 15 dígitos numéricos');
  }
  if (!esTexto(d.nombre, 50)) errores.push('El nombre es obligatorio (máximo 50 caracteres)');
  if (!Object.keys(PESO_MAXIMO).includes(d.especie)) {
    errores.push(`La especie debe ser una de: ${Object.keys(PESO_MAXIMO).join(', ')}`);
  }
  if (!esTexto(d.raza, 50)) errores.push('La raza es obligatoria (máximo 50 caracteres)');
  if (!Number.isInteger(d.edad) || d.edad < 0 || d.edad > 30) {
    errores.push('La edad debe ser un número entero entre 0 y 30');
  }
  if (typeof d.peso !== 'number' || d.peso <= 0) {
    errores.push('El peso debe ser un número mayor a 0');
  } else if (PESO_MAXIMO[d.especie] && d.peso > PESO_MAXIMO[d.especie]) {
    errores.push(`El peso de un ${d.especie} no puede superar ${PESO_MAXIMO[d.especie]} kg`);
  }
  if (typeof d.telefono_dueno !== 'string' || !/^09\d{8}$/.test(d.telefono_dueno)) {
    errores.push('El teléfono del dueño debe tener 10 dígitos y empezar con 09');
  }
  if (d.hospitalizado !== undefined && typeof d.hospitalizado !== 'boolean') {
    errores.push('El campo hospitalizado debe ser true o false');
  }
  return errores;
}

// Toma solo los campos permitidos del body
function leerBody(body = {}) {
  const { chip, nombre, especie, raza, edad, peso, telefono_dueno, hospitalizado } = body;
  return {
    chip, nombre: nombre?.trim?.() ?? nombre, especie, raza: raza?.trim?.() ?? raza,
    edad, peso, telefono_dueno, hospitalizado: hospitalizado ?? false,
  };
}

// Error 23505 de PostgreSQL = violación de UNIQUE (chip repetido)
const esChipDuplicado = (err) => err.code === '23505';

async function listarMascotas(req, res) {
  const mascotas = await mascota.listarMascotas();
  res.status(200).json(mascotas);
}

async function obtenerMascotaPorId(req, res) {
  const { id } = req.params;
  if (!idValido(id)) return res.status(400).json({ error: 'ID inválido' });

  const encontrada = await mascota.obtenerMascotaPorId(id);
  if (!encontrada) return res.status(404).json({ error: 'Mascota no encontrada' });

  res.status(200).json(encontrada);
}

async function crearMascota(req, res) {
  const datos = leerBody(req.body);
  const errores = validarMascota(datos);
  if (errores.length > 0) return res.status(400).json({ errores });

  try {
    const nueva = await mascota.crearMascota(datos);
    res.status(201).json(nueva);
  } catch (err) {
    if (esChipDuplicado(err)) {
      return res.status(409).json({ error: 'Ya existe una mascota registrada con ese chip' });
    }
    throw err;
  }
}

async function actualizarMascota(req, res) {
  const { id } = req.params;
  if (!idValido(id)) return res.status(400).json({ error: 'ID inválido' });

  const datos = leerBody(req.body);
  const errores = validarMascota(datos);
  if (errores.length > 0) return res.status(400).json({ errores });

  try {
    const actualizada = await mascota.actualizarMascota(id, datos);
    if (!actualizada) return res.status(404).json({ error: 'Mascota no encontrada' });
    res.status(200).json(actualizada);
  } catch (err) {
    if (esChipDuplicado(err)) {
      return res.status(409).json({ error: 'Ya existe otra mascota registrada con ese chip' });
    }
    throw err;
  }
}

async function eliminarMascota(req, res) {
  const { id } = req.params;
  if (!idValido(id)) return res.status(400).json({ error: 'ID inválido' });

  const existente = await mascota.obtenerMascotaPorId(id);
  if (!existente) return res.status(404).json({ error: 'Mascota no encontrada' });

  // Regla de negocio: no se puede eliminar una mascota hospitalizada
  if (existente.hospitalizado) {
    return res.status(409).json({ error: 'No se puede eliminar una mascota que está hospitalizada' });
  }

  await mascota.eliminarMascota(id);
  res.status(204).send();
}

module.exports = {
  listarMascotas,
  obtenerMascotaPorId,
  crearMascota,
  actualizarMascota,
  eliminarMascota,
};
