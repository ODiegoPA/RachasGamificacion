module.exports = app => {
    let router = require("express").Router();
    const controller = require("../controllers/historial.controller");

    router.post("/generar", controller.crearHistorial);
    app.use('/historial', router);
}