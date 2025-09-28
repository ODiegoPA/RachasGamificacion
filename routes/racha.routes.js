module.exports = app => {
    let router = require("express").Router();
    const controller = require("../controllers/racha.controller");

    router.get("/:usuarioId", controller.getRacha);
    router.get("/mes", controller.getRachasDelMes);
    router.post("/verificar/:id", controller.verificarRachaDiaria);
    app.use('/racha', router);
};