const db = require("../models");

exports.getRacha = async (req, res) => {
    try {
        const { usuarioId } = req.params;
        const racha = await db.racha.findOne({ where: { usuarioId } });
        if (!racha) {
            return res.status(404).json({ msg: "Racha no encontrada" });
        }
        return res.status(200).json({ msg: "Racha encontrada", racha });
    } catch (error) {
        console.error("Error al obtener la racha:", error);
        return res.status(500).json({ msg: "Error en el servidor" });
    }
};
exports.getRachasDelMes = async (req, res) => {
  try {
    const fechaCfg = await db.fecha.findOne();

    let fechaBase = new Date();
    if (fechaCfg && fechaCfg.estaSimulada && fechaCfg.fechaSimulada) {
        fechaBase = new Date(fechaCfg.fechaSimulada);
    }


    const inicioMes = new Date(fechaBase.getFullYear(), fechaBase.getMonth(), 1, 0, 0, 0);
    console.log(inicioMes);
    const finMes = new Date(fechaBase.getFullYear(), fechaBase.getMonth() + 1, 1, 0, 0, 0);
    console.log(finMes);

    const rachas = await db.racha.findAll({
      where: {
        fecha: {
          [db.Sequelize.Op.gte]: inicioMes,
          [db.Sequelize.Op.lt]: finMes,
        },
      },
      include: [
        { model: db.usuario, as: "usuario" },
      ],
      order: [['puntos', 'DESC'], ['dias', 'DESC']],
    });

    if (!rachas || rachas.length === 0) {
      return res.status(404).json({ msg: "No se encontraron rachas para este mes", inicioMes, finMes });
    }

    return res.status(200).json({
      msg: "Rachas encontradas",
      mes: fechaBase.getMonth() + 1,
      anio: fechaBase.getFullYear(),
      rachas,
    });
  } catch (error) {
    console.error("Error al obtener las rachas del mes:", error);
    return res.status(500).json({ msg: "Error en el servidor" });
  }
};


//funcion pura
function ymd(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

//funcion pura
function diffDays(a, b) {
  const ms = ymd(a) - ymd(b);
  return Math.round(ms / (1000 * 60 * 60 * 24));
}

exports.verificarRachaDiaria = async (req, res) => {
  try {
    const { usuarioId } = req.params;

    const usuario = await db.usuario.findOne({
      where: { id: usuarioId },
      include: [{ model: db.racha, as: "racha" }]
    });

    if (!usuario) {
      return res.status(404).json({ msg: "Usuario no encontrado" });
    }
    if (!usuario.racha) {
      return res.status(404).json({ msg: "No se encontró racha para el usuario" });
    }

    const cfg = await db.fecha.findOne();
    let base = cfg.fechaReal ?? new Date();
    if (cfg && cfg.estaSimulada && cfg.fechaSimulada) {
      base = cfg.fechaSimulada;
    }
    const hoy = ymd(base);

    const racha = usuario.racha;
    let dias = racha.dias ?? 0;
    let puntos = racha.puntos ?? 0;
    let fechaRacha = racha.fecha ? ymd(new Date(racha.fecha)) : null;

    let accion = "sin_cambios";

    if (!fechaRacha) {
      dias = 0;
      puntos += 0;
      accion = "primera_vez";
    } else {
      const d = diffDays(hoy, fechaRacha);

      if (d === 0) {
        accion = "mismo_dia";
      } else if (d === 1) {
        // día siguiente → aumentar racha
        dias = dias + 1;
        puntos += (dias >= 5 ? 5 : 1);
        accion = "dia_siguiente_sumado";
      } else if (d >= 2) {
        // racha rota → reiniciar
        dias = 0;
        accion = "racha_rotay_reinicia";
      }
    }

    // guardar cambios si hubo
    if (accion !== "mismo_dia" && accion !== "sin_cambios") {
      await racha.update({
        dias,
        puntos,
        fecha: hoy,
        estaPrendida: true
      });
    } else {
      await racha.update({
        estaPrendida: true
      });
    }

    return res.status(200).json({
      msg: "Verificación completada",
      accion,
      racha: {
        id: racha.id,
        usuarioId: racha.usuarioId,
        dias,
        puntos,
        fecha: hoy
      }
    });
  } catch (error) {
    console.error("Error al verificar la racha diaria:", error);
    return res.status(500).json({ msg: "Error en el servidor" });
  }
};