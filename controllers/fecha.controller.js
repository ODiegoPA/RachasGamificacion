const db = require("../models");

exports.createFecha = async (req, res) => {
    try {
        const { fechaReal } = req.body;
        if (!fechaReal) {
            return res.status(400).json({ msg: "La fecha es obligatoria" });
        }

        const nuevaFecha = await db.fecha.create({ fechaReal });
        return res.status(201).json({ msg: "Fecha creada exitosamente", fecha: nuevaFecha });
    } catch (error) {
        console.error("Error al crear la fecha:", error);
        return res.status(500).json({ msg: "Error en el servidor" });
    }
};
exports.modificarFecha = async (req, res) => {
    try {
        const { fechaSimulada } = req.body;
        const fecha = await db.fecha.findOne();

        if (!fecha) {
            return res.status(404).json({ msg: "Fecha no encontrada" });
        }
        if (fechaSimulada) {
            fecha.fechaSimulada = fechaSimulada;
            fecha.estaSimulada = true;
        }
        await fecha.save();
        return res.status(200).json({ msg: "Fecha modificada exitosamente", fecha });
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
        fecha.estaSimulada = false;
        fecha.fechaSimulada = null;
        await fecha.save();
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
