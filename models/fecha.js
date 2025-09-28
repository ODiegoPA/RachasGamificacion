module.exports = (sequelize, Sequelize) => {
    const Fecha = sequelize.define("fecha", {
        fechaReal : {
            type: Sequelize.DATE
        },
        estaSimulada : {
            type: Sequelize.BOOLEAN
        },
        fechaSimulada : {
            type: Sequelize.DATE
        },
    });
    return Fecha;
}