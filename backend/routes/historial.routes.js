module.exports = app => {
    let router = require("express").Router();
    const controller = require("../controllers/historial.controller");

    router.post("/generar", controller.crearHistorialYReset);
    router.get("/puntos", controller.getPuntosHistoricos);
    router.get("/periodo", controller.getHistorialPorPeriodo);
    app.use('/historial', router);
}