module.exports = app => {
    let router = require("express").Router();
    const controller = require("../controllers/fecha.controller");

    router.post("/", controller.createFecha);
    router.post("/modificar", controller.modificarFecha);
    router.post("/reset", controller.resetFecha);
    router.get("/", controller.getFecha);
    app.use('/fecha', router);
}