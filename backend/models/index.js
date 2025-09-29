const dbConfig = require("../config/db.config.js");
const Sequelize = require("sequelize");

const sequelize = new Sequelize(
    dbConfig.DB,
    dbConfig.USER,
    dbConfig.PASSWORD,
    {
        host: dbConfig.HOST,
        port: dbConfig.PORT,
        dialect: "mysql",
    }
);


const db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.racha = require("./racha.js")(sequelize, Sequelize);
db.historial = require("./historial.js")(sequelize, Sequelize);
db.fecha = require("./fecha.js")(sequelize, Sequelize);
db.usuario = require("./usuario.js")(sequelize, Sequelize);

db.usuario.hasOne(db.racha, {
  as: "racha",
  foreignKey: "usuarioId",   // 👈 explícito
});

db.racha.belongsTo(db.usuario, {
  as: "usuario",
  foreignKey: "usuarioId",   // 👈 mismo nombre
});

// Historial
db.usuario.hasMany(db.historial, {
  as: "historiales",
  foreignKey: "usuarioId",
});
db.historial.belongsTo(db.usuario, {
  as: "usuario",
  foreignKey: "usuarioId",
});

// Fecha ↔ Racha
db.fecha.hasMany(db.racha, {
  as: "rachas",
  foreignKey: "fechaId",
});
db.racha.belongsTo(db.fecha, {
  as: "fechaCfg",
  foreignKey: "fechaId",
});

module.exports = db;