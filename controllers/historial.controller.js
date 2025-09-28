const db = require("../models");

exports.crearHistorial = async (req, res) => {
  try {
    // 1) Fecha base: simulada si está activa, si no la real
    const fechaCfg = await db.fecha.findOne();
    let base = new Date();
    if (fechaCfg && fechaCfg.estaSimulada && fechaCfg.fechaSimulada) {
      base = new Date(fechaCfg.fechaSimulada);
    }

    // 2) Mes/año vigentes y rango [inicioMes, finMes)
    const anio = base.getFullYear();
    const mesNum = base.getMonth(); // 0..11
    const mes = String(mesNum + 1).padStart(2, "0");
    const inicioMes = new Date(anio, mesNum, 1, 0, 0, 0);
    const finMes = new Date(anio, mesNum + 1, 1, 0, 0, 0);

    const { Op } = db.Sequelize;
    const rachas = await db.racha.findAll({
      where: { fecha: { [Op.gte]: inicioMes, [Op.lt]: finMes } },
    });

    if (!rachas || rachas.length === 0) {
      return res.status(404).json({ msg: "No hay rachas en el mes vigente", mes, anio });
    }

    const ahora = new Date();
    let creados = 0, actualizados = 0;

    for (const r of rachas) {
      const existente = await db.historial.findOne({
        where: { usuarioId: r.usuarioId, mes, ano: anio },
      });

      if (existente) {
        existente.dias = r.dias ?? 0;
        existente.puntos = r.puntos ?? 0;
        existente.fechaUltimaActualizacion = ahora;
        await existente.save();
        actualizados++;
      } else {
        await db.historial.create({
          usuarioId: r.usuarioId,
          dias: r.dias ?? 0,
          puntos: r.puntos ?? 0,
          mes,
          ano: anio,
          fechaUltimaActualizacion: ahora,
        });
        creados++;
      }
    }

    return res.status(201).json({
      msg: "Historial creado/actualizado para el mes vigente",
      mes,
      anio,
      creados,
      actualizados,
      total: rachas.length,
    });
  } catch (error) {
    console.error("Error al crear historial:", error);
    return res.status(500).json({ msg: "Error en el servidor" });
  }
};