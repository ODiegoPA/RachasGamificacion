module.exports = (sequelize, Sequelize) => {
    const Racha = sequelize.define("racha", {
        dias: {
            type: Sequelize.INTEGER
        },
        puntos: {
            type: Sequelize.INTEGER
        },
        estaPrendida: {
            type: Sequelize.BOOLEAN
        },
        fecha: {
            type: Sequelize.DATE
        },
    });
    return Racha;
};