module.exports = app => {
    let router = require("express").Router();
    const controller = require("../controllers/usuario.controller");

    //funciones de orden superior
    router.post("/register", controller.register);
    router.post("/login", controller.login);
    app.use('/usuario', router);
}