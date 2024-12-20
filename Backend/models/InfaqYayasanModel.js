const { DataTypes } = require('sequelize');
const db = require('../config/Database.js');

const InfaqYayasan = db.define('infaq_yayasan', {
    tahun_pelajaran: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: true
        }
    },
}, {
    freezeTableName: true,
    timestamps: true
});


module.exports = InfaqYayasan;
