module.exports = app => {
    require("./usuario.routes")(app);
    require("./racha.routes")(app);
    require("./fecha.routes")(app);
    require("./historial.routes")(app);
    
}