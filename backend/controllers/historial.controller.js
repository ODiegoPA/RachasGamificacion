const db = require("../models");

exports.crearHistorialYReset = async (req, res) => {
  const t = await db.sequelize.transaction();
  try {
    const fechaCfg = await db.fecha.findOne({ transaction: t });
    let base = new Date();
    if (fechaCfg?.estaSimulada && fechaCfg?.fechaSimulada) {
      base = new Date(fechaCfg.fechaSimulada);
    }

    const anioBase = base.getFullYear();
    const mesBaseNum = base.getMonth();

    let anio = anioBase;
    let mesNum = mesBaseNum - 1;
    if (mesNum < 0) {
      mesNum = 11;
      anio = anioBase - 1;
    }

    const mes = String(mesNum + 1).padStart(2, "0");
    const inicioMes = new Date(anio, mesNum, 1, 0, 0, 0);
    const finMes = new Date(anio, mesNum + 1, 1, 0, 0, 0);

    const { Op } = db.Sequelize;

    const rachas = await db.racha.findAll({
      where: { fecha: { [Op.gte]: inicioMes, [Op.lt]: finMes } },
      transaction: t,
      lock: t.LOCK.UPDATE,
    });

    if (!rachas || rachas.length === 0) {
      await t.rollback();
      return res.status(404).json({ msg: "No hay rachas en el mes anterior", mes, anio });
    }

    const ahora = new Date();
    let creados = 0, actualizados = 0;

    for (const r of rachas) {
      const existente = await db.historial.findOne({
        where: { usuarioId: r.usuarioId, mes, ano: anio },
        transaction: t,
        lock: t.LOCK.UPDATE,
      });

      if (existente) {
        existente.dias = r.dias ?? 0;
        existente.puntos = r.puntos ?? 0;
        existente.fechaUltimaActualizacion = ahora;
        await existente.save({ transaction: t });
        actualizados++;
      } else {
        await db.historial.create({
          usuarioId: r.usuarioId,
          dias: r.dias ?? 0,
          puntos: r.puntos ?? 0,
          mes,
          ano: anio,
          fechaUltimaActualizacion: ahora,
        }, { transaction: t });
        creados++;
      }
    }

    await db.racha.update(
      {
        dias: 0,
        puntos: 0,
        estaPrendida: false,
        fecha: null,
      },
      { where: {}, transaction: t }
    );

    await t.commit();

    return res.status(201).json({
      msg: "Historial del mes anterior generado y rachas reseteadas",
      mes,
      anio,
      creados,
      actualizados,
      totalProcesadas: rachas.length,
    });
  } catch (error) {
    await t.rollback();
    console.error("Error al crear historial y resetear rachas:", error);
    return res.status(500).json({ msg: "Error en el servidor" });
  }
};



exports.getPuntosHistoricos = async (req, res) => {
  try {
    const usuarioId = req.params.usuarioId || req.query.usuarioId || null;

    const { fn, col, literal } = db.Sequelize;

    if (usuarioId) {
      const agg = await db.historial.findOne({
        attributes: [
          [fn("COALESCE", fn("SUM", col("puntos")), 0), "puntosTotales"],
          [fn("COALESCE", fn("SUM", col("dias")), 0), "diasTotales"],
          [fn("COUNT", literal("*")), "registros"],
        ],
        where: { usuarioId },
        raw: true,
      });

      return res.status(200).json({
        usuarioId,
        puntosTotales: Number(agg?.puntosTotales ?? 0),
        diasTotales: Number(agg?.diasTotales ?? 0),
        registros: Number(agg?.registros ?? 0),
      });
    }

    const filas = await db.historial.findAll({
      attributes: [
        "usuarioId",
        [fn("COALESCE", fn("SUM", col("puntos")), 0), "puntosTotales"],
        [fn("COALESCE", fn("SUM", col("dias")), 0), "diasTotales"],
        [fn("COUNT", literal("*")), "registros"],
      ],
      group: ["usuarioId"],
      raw: true,
    });

    return res.status(200).json({
      totalUsuarios: filas.length,
      resultados: filas.map(f => ({
        usuarioId: f.usuarioId,
        puntosTotales: Number(f.puntosTotales),
        diasTotales: Number(f.diasTotales),
        registros: Number(f.registros),
      })),
    });
  } catch (error) {
    console.error("Error al obtener puntos históricos:", error);
    return res.status(500).json({ msg: "Error en el servidor" });
  }
};

exports.getHistorialPorPeriodo = async (req, res) => {
  try {
    let { mes, ano } = req.body;

    if (mes == null || ano == null) {
      return res.status(400).json({ msg: "Debe enviar 'mes' (1-12) y 'ano' en el body." });
    }

    const mesNum = parseInt(mes, 10);
    const anoNum = parseInt(ano, 10);

    if (Number.isNaN(mesNum) || Number.isNaN(anoNum) || mesNum < 1 || mesNum > 12) {
      return res.status(400).json({ msg: "Parámetros inválidos: 'mes' 1..12 y 'ano' numérico." });
    }

    const mesStr = String(mesNum).padStart(2, "0");

    const { fn, col, literal } = db.Sequelize;

    const registros = await db.historial.findAll({
      where: { mes: mesStr, ano: anoNum },
      order: [["puntos", "DESC"], ["dias", "DESC"]],
      include: [{ model: db.usuario, as: "usuario", attributes: ["id", "nombres", "apellidos", "email"] }],
    });

    const resumen = await db.historial.findAll({
      attributes: [
        "usuarioId",
        [fn("COALESCE", fn("SUM", col("puntos")), 0), "puntosTotales"],
        [fn("COALESCE", fn("SUM", col("dias")), 0), "diasTotales"],
        [fn("COUNT", literal("*")), "registros"]
      ],
      where: { mes: mesStr, ano: anoNum },
      group: ["usuarioId"],
      order: [["usuarioId", "ASC"]],
      raw: true,
    });

    return res.status(200).json({
      msg: "Historial del período (todos los usuarios)",
      periodo: { mes: mesStr, ano: anoNum },
      totalRegistros: registros.length,
      totalUsuarios: resumen.length,
      resumenPorUsuario: resumen.map(r => ({
        usuarioId: r.usuarioId,
        puntosTotales: Number(r.puntosTotales),
        diasTotales: Number(r.diasTotales),
        registros: Number(r.registros),
      })),
      data: registros,
    });
  } catch (error) {
    console.error("Error al listar historial por período (general):", error);
    return res.status(500).json({ msg: "Error en el servidor" });
  }
};

