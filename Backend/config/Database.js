const { Sequelize } = require("sequelize");

const db = new Sequelize('dikdasm2_db_keuangan', 'dikdasm2_admin', 'Dikdasmen126', {
    host: "dikdasmendanpnftpi.com",
    port: "3306",
    dialect: "mysql"
});

module.exports = db;
