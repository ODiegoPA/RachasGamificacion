const db = require("../models");

exports.createFecha = async (req, res) => {
    try {
        const fechaReal = new Date();
        if (!fechaReal) {
            return res.status(400).json({ msg: "La fecha es obligatoria" });
        }

        const nuevaFecha = await db.fecha.create({ fechaReal, estaSimulada: false, fechaSimulada: null });
        return res.status(201).json({ msg: "Fecha creada exitosamente", fecha: nuevaFecha });
    } catch (error) {
        console.error("Error al crear la fecha:", error);
        return res.status(500).json({ msg: "Error en el servidor" });
    }
};
// Helper: normaliza a mediodía local si viene 'YYYY-MM-DD'
function normalizeToLocalNoon(input) {
  if (typeof input === 'string') {
    const m = input.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (m) {
      const [, y, mo, d] = m;
      // Mediodía LOCAL para evitar que el midnight UTC te “retroceda” un día
      return new Date(Number(y), Number(mo) - 1, Number(d), 12, 0, 0, 0);
    }
    // Si trae hora o es otro formato válido, que JS lo parsee
    return new Date(input);
  }
  // Si ya es Date u otro tipo
  return new Date(input);
}

exports.modificarFecha = async (req, res) => {
  try {
    const { fechaSimulada } = req.body;
    const fecha = await db.fecha.findOne();

    if (!fecha) {
      return res.status(404).json({ msg: "Fecha no encontrada" });
    }

    if (fechaSimulada) {
      const normalized = normalizeToLocalNoon(fechaSimulada);

      if (isNaN(normalized.getTime())) {
        return res.status(400).json({ msg: "fechaSimulada inválida" });
      }

      // Puedes guardar como Date directamente...
      fecha.fechaSimulada = normalized; 
      // ...o si prefieres ISO:
      // fecha.fechaSimulada = normalized.toISOString();

      fecha.estaSimulada = true;
    }

    await fecha.save();

    // Al cambiar la fecha, apagar todas las rachas
    await db.racha.update(
      { estaPrendida: false },
      { where: {} }
    );

    return res.status(200).json({
      msg: "Fecha modificada exitosamente",
      fecha
    });
  } catch (error) {
    console.error("Error al modificar la fecha:", error);
    return res.status(500).json({ msg: "Error en el servidor" });
  }
};

exports.resetFecha = async (req, res) => {
    try {
        const fecha = await db.fecha.findOne();
        if (!fecha) {
            return res.status(404).json({ msg: "Fecha no encontrada" });
        }
        const nuevaFecha = new Date();
        fecha.estaSimulada = false;
        fecha.fechaSimulada = null;
        fecha.fechaReal = nuevaFecha;
        await fecha.save();
        await db.racha.update(
          { fecha: nuevaFecha},
          { where: {} }
        );
        return res.status(200).json({ msg: "Fecha reseteada exitosamente", fecha });
    } catch (error) {
        console.error("Error al resetear la fecha:", error);
        return res.status(500).json({ msg: "Error en el servidor" });
    }
};
exports.getFecha = async (req, res) => {
    try {
        const fecha = await db.fecha.findOne();
        if (!fecha) {
            return res.status(404).json({ msg: "Fecha no encontrada" });
        }
        return res.status(200).json({ msg: "Fecha encontrada", fecha });
    } catch (error) {
        console.error("Error al obtener la fecha:", error);
        return res.status(500).json({ msg: "Error en el servidor" });
    }
};


function ymd(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function diffDays(a, b) {
  const ms = ymd(a) - ymd(b);
  return Math.round(ms / (1000 * 60 * 60 * 24));
}

exports.cambioDia = async (req, res) => {
  try {
    const fechaCfg = await db.fecha.findOne();

    // Caso 1: simulada → todas falsas directamente
    if (fechaCfg && fechaCfg.estaSimulada && fechaCfg.fechaSimulada) {
      await db.racha.update({ estaPrendida: false }, { where: {} });
      return res.status(200).json({
        msg: "Se usó fecha simulada, todas las rachas fueron apagadas",
        modo: "simulada",
      });
    }

    const hoy = ymd(new Date());

    const rachas = await db.racha.findAll();

    let actualizadas = 0;
    for (const racha of rachas) {
      if (racha.fecha) {
        const fechaRacha = ymd(new Date(racha.fecha));
        const d = diffDays(hoy, fechaRacha);

        if (d >= 1) {
          await racha.update({ estaPrendida: false });
          actualizadas++;
        }
      } else {
        await racha.update({ estaPrendida: false });
        actualizadas++;
      }
    }

    return res.status(200).json({
      msg: "Cambio de día procesado",
      modo: "real",
      rachasApagadas: actualizadas,
    });
  } catch (error) {
    console.error("Error al cambiar el día:", error);
    return res.status(500).json({ msg: "Error en el servidor" });
  }
};
