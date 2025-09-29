module.exports = app => {
    let router = require("express").Router();
    const controller = require("../controllers/racha.controller");

    router.get("/usuario/:usuarioId", controller.getRacha);
    router.get("/mes", controller.getRachasDelMes);
    router.post("/verificar/:usuarioId", controller.verificarRachaDiaria);
    app.use('/racha', router);
};