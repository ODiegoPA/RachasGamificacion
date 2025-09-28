module.exports = (sequelize, Sequelize) => {
    const Historial = sequelize.define("historial", {
        dias: {
            type: Sequelize.INTEGER
        },
        puntos: {
            type: Sequelize.INTEGER
        },
        mes: {
            type: Sequelize.STRING
        },
        ano: {
            type: Sequelize.INTEGER
        },
        fechaUltimaActualizacion: {
            type: Sequelize.DATE
        },
    });
    return Historial;
}