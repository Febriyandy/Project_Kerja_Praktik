const { DataTypes } = require('sequelize');
const db = require('../config/Database.js');

const Sekolah = db.define('sekolah', {
    npsn: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true, 
    },
    tingkat_sekolah: {
        type: DataTypes.STRING,
        allowNull: false,
    }
}, {
    freezeTableName: true,
    timestamps: true, 
});


module.exports = Sekolah;
